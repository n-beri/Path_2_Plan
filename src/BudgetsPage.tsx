import React, { useState, FormEvent, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Doc, Id } from '../convex/_generated/dataModel';
import { toast } from "sonner";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());

  const budgetSummaryData = useQuery(api.budgets.getBudgetSummary, { monthYear: selectedMonth });
  const budgetSummary = budgetSummaryData || [];
  
  const transactionCategoriesData = useQuery(api.transactions.getTransactionCategories);
  const transactionCategories = transactionCategoriesData || [];

  const uniqueBudgetData = useQuery(api.budgets.getUniqueBudgetCategoryMonths);
  const existingBudgetMonths = uniqueBudgetData?.monthYears || [getCurrentMonthYear()];
  const allCategoriesForBudgets = uniqueBudgetData?.categories || [];


  const setBudgetMutation = useMutation(api.budgets.setBudget);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(""); // For the modal
  const [allocatedAmount, setAllocatedAmount] = useState("");

  // Determine categories available for new budgets this month
  const categoriesAvailableForNewBudget = useMemo(() => {
    const budgetedCategoriesThisMonth = new Set(budgetSummary.map(b => b.category));
    // Include all transaction categories and all categories ever budgeted
    const combinedKnownCategories = new Set([...transactionCategories, ...allCategoriesForBudgets]);
    return Array.from(combinedKnownCategories).filter(cat => !budgetedCategoriesThisMonth.has(cat)).sort();
  }, [budgetSummary, transactionCategories, allCategoriesForBudgets]);


  useEffect(() => {
    // If selectedMonth changes, and there are no budgets for it,
    // and there are categories available, pre-select the first available category for the modal.
    if (categoriesAvailableForNewBudget.length > 0) {
      setEditingCategory(categoriesAvailableForNewBudget[0]);
    } else {
      setEditingCategory(""); // Or handle no categories available
    }
  }, [selectedMonth, categoriesAvailableForNewBudget]);


  const openModalForSetBudget = (category?: string, currentAllocation?: number) => {
    if (category) { // Editing existing budget for the month
      setEditingCategory(category);
      setAllocatedAmount(currentAllocation?.toString() || "");
    } else { // Setting new budget for the month
       setEditingCategory(categoriesAvailableForNewBudget.length > 0 ? categoriesAvailableForNewBudget[0] : "");
       setAllocatedAmount("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory("");
    setAllocatedAmount("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !allocatedAmount) {
      toast.error("Please select a category and enter an allocated amount.");
      return;
    }
    const parsedAmount = parseFloat(allocatedAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) { // Allow 0 for budget
      toast.error("Allocated amount must be a non-negative number.");
      return;
    }

    try {
      await setBudgetMutation({
        category: editingCategory,
        allocatedAmount: parsedAmount,
        monthYear: selectedMonth,
      });
      toast.success(`Budget for ${editingCategory} ${budgetSummary.find(b=>b.category === editingCategory) ? 'updated' : 'set'} successfully!`);
      closeModal();
    } catch (error) {
      console.error("Failed to set budget:", error);
      toast.error("Failed to set budget. " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  const displayMonths = useMemo(() => {
    const months = new Set(existingBudgetMonths);
    if (!months.has(getCurrentMonthYear())) {
      months.add(getCurrentMonthYear());
    }
    return Array.from(months).sort().reverse();
  }, [existingBudgetMonths]);


  if (budgetSummaryData === undefined || transactionCategoriesData === undefined || uniqueBudgetData === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const totalAllocated = budgetSummary.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpent = budgetSummary.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = totalAllocated - totalSpent;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">My Budgets</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="monthSelectorBudget" className="text-sm font-medium text-gray-700">Month:</label>
          <select
            id="monthSelectorBudget"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          >
            {displayMonths.map(month => (
              <option key={month} value={month}>{new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</option>
            ))}
          </select>
          {categoriesAvailableForNewBudget.length > 0 && (
            <button
              onClick={() => openModalForSetBudget()}
              className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary-hover transition duration-150"
            >
              Set New Budget
            </button>
          )}
        </div>
      </div>

      {budgetSummary.length === 0 && categoriesAvailableForNewBudget.length === 0 && (
         <div className="text-center py-10 bg-white rounded-xl shadow">
          <p className="text-xl text-gray-600">No budgets set for {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}.</p>
          <p className="text-gray-500">Add some transactions with categories first, then you can set budgets for them here.</p>
        </div>
      )}
      {budgetSummary.length === 0 && categoriesAvailableForNewBudget.length > 0 && (
         <div className="text-center py-10 bg-white rounded-xl shadow">
          <p className="text-xl text-gray-600">No budgets set for {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}.</p>
          <p className="text-gray-500">Click "Set New Budget" to allocate funds for your spending categories.</p>
        </div>
      )}


      {budgetSummary.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-blue-700">Total Allocated</h3>
              <p className="text-2xl font-semibold text-blue-900">{formatCurrency(totalAllocated)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-red-700">Total Spent</h3>
              <p className="text-2xl font-semibold text-red-900">{formatCurrency(totalSpent)}</p>
            </div>
            <div className={`p-4 rounded-lg shadow ${totalRemaining >= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
              <h3 className={`text-sm font-medium ${totalRemaining >= 0 ? 'text-green-700' : 'text-orange-700'}`}>Total Remaining</h3>
              <p className={`text-2xl font-semibold ${totalRemaining >= 0 ? 'text-green-900' : 'text-orange-900'}`}>{formatCurrency(totalRemaining)}</p>
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Budget Details</h2>
            <div className="space-y-4">
              {budgetSummary.map((budget) => {
                const progress = budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0;
                const isOverBudget = budget.spentAmount > budget.allocatedAmount;
                return (
                  <div key={budget._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-800">{budget.category}</span>
                      <button 
                        onClick={() => openModalForSetBudget(budget.category, budget.allocatedAmount)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Spent: {formatCurrency(budget.spentAmount)}</span>
                      <span>Allocated: {formatCurrency(budget.allocatedAmount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs mt-1">
                      {isOverBudget ? (
                        <span className="text-red-600 font-semibold">
                          Over budget by {formatCurrency(budget.spentAmount - budget.allocatedAmount)} ({progress.toFixed(0)}%)
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {formatCurrency(budget.allocatedAmount - budget.spentAmount)} remaining ({progress.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {budgetSummary.find(b=>b.category === editingCategory) ? "Edit Budget" : "Set New Budget"} for {selectedMonth}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  id="category"
                  value={editingCategory}
                  onChange={(e) => setEditingCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  // Disable if we are "editing" an existing budget for the month (category is fixed)
                  disabled={!!budgetSummary.find(b=>b.category === editingCategory)} 
                >
                  <option value="">-- Select Category --</option>
                  {/* If editing, only show that category. If new, show available.*/}
                  {budgetSummary.find(b=>b.category === editingCategory) ? (
                     <option value={editingCategory}>{editingCategory}</option>
                  ) : (
                    categoriesAvailableForNewBudget.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="allocatedAmount" className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount ($)*</label>
                <input
                  type="number"
                  id="allocatedAmount"
                  value={allocatedAmount}
                  onChange={(e) => setAllocatedAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="e.g., 200"
                  min="0"
                  step="0.01"
                  required
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
                  {budgetSummary.find(b=>b.category === editingCategory) ? "Update Budget" : "Set Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
