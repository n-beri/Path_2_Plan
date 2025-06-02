import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Doc, Id } from '../convex/_generated/dataModel';
import { toast } from "sonner";

// Helper to format date for input type="date"
const formatDateForInput = (isoDate: string) => {
  if (!isoDate) return "";
  // Assuming targetDate is stored as "YYYY-MM-DD" string from the input
  // If it includes time, split by 'T'
  return isoDate.includes('T') ? isoDate.split('T')[0] : isoDate;
};

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function GoalsPage() {
  const goals = useQuery(api.goals.getGoals); // Removed || [] to let undefined state be handled
  const createGoal = useMutation(api.goals.createGoal);
  const updateGoal = useMutation(api.goals.updateGoal);
  const deleteGoal = useMutation(api.goals.deleteGoal);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Doc<"goals"> | null>(null);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");

  const openModalForCreate = () => {
    setEditingGoal(null);
    setName("");
    setTargetAmount("");
    setCurrentAmount("0"); 
    setTargetDate("");
    setDescription("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (goal: Doc<"goals">) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setTargetDate(formatDateForInput(goal.targetDate));
    setDescription(goal.description || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetDate) {
      toast.error("Please fill in all required fields: Name, Target Amount, and Target Date.");
      return;
    }
    const parsedTargetAmount = parseFloat(targetAmount);
    const parsedCurrentAmount = parseFloat(currentAmount || "0");

    if (isNaN(parsedTargetAmount) || isNaN(parsedCurrentAmount)) {
        toast.error("Amounts must be valid numbers.");
        return;
    }
    if (parsedTargetAmount <= 0) {
        toast.error("Target amount must be greater than zero.");
        return;
    }
    // Basic date validation: ensure it's not in the past (optional, but good UX)
    const today = new Date();
    today.setHours(0,0,0,0); // Compare dates only
    const selectedDate = new Date(targetDate + "T00:00:00"); // Ensure consistent comparison
     if (selectedDate < today && !editingGoal) { // Only for new goals or if date is changed
      // For editing, you might allow past dates if they are not changing it or if it's historical
      // toast.error("Target date cannot be in the past.");
      // return;
    }


    try {
      if (editingGoal) {
        await updateGoal({
          goalId: editingGoal._id,
          name,
          targetAmount: parsedTargetAmount,
          currentAmount: parsedCurrentAmount,
          targetDate, 
          description,
        });
        toast.success("Goal updated successfully!");
      } else {
        await createGoal({
          name,
          targetAmount: parsedTargetAmount,
          currentAmount: parsedCurrentAmount,
          targetDate, 
          description,
        });
        toast.success("Goal created successfully!");
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save goal:", error);
      toast.error("Failed to save goal. " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDelete = async (goalId: Id<"goals">) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteGoal({ goalId });
        toast.success("Goal deleted successfully!");
      } catch (error) {
        console.error("Failed to delete goal:", error);
        toast.error("Failed to delete goal. " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };
  
  if (goals === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Financial Goals</h1>
        <button
          onClick={openModalForCreate}
          className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary-hover transition duration-150"
        >
          Add New Goal
        </button>
      </div>

      {goals.length === 0 && (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">You haven't set any goals yet.</p>
          <p className="text-gray-500">Click "Add New Goal" to get started!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          return (
            <div key={goal._id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-2">{goal.name}</h2>
                {goal.description && <p className="text-gray-600 mb-3 text-sm">{goal.description}</p>}
                <p className="text-gray-700 mb-1">
                  Target: <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                </p>
                <p className="text-gray-700 mb-1">
                  Saved: <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  Deadline: {new Date(goal.targetDate + "T00:00:00Z").toLocaleDateString(undefined, { timeZone: 'UTC' })}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm text-gray-600 mb-4">{progress.toFixed(0)}% complete</p>
              </div>
              <div className="flex justify-end space-x-3 mt-auto">
                <button
                  onClick={() => openModalForEdit(goal)}
                  className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md transition duration-150"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(goal._id)}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md transition duration-150"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {editingGoal ? "Edit Goal" : "Create New Goal"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Goal Name*</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($)*</label>
                <input
                  type="number"
                  id="targetAmount"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="e.g., 5000"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">Currently Saved ($)</label>
                <input
                  type="number"
                  id="currentAmount"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="e.g., 500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">Target Date*</label>
                <input
                  type="date"
                  id="targetDate"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="e.g., Down payment for a new car"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition"
                >
                  {editingGoal ? "Save Changes" : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
