import React, { useState, FormEvent, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Doc, Id } from '../convex/_generated/dataModel';
import { toast } from "sonner";

// Helper to format date for input type="date"
const formatDateForInput = (isoDate?: string) => {
  if (!isoDate) return new Date().toISOString().split('T')[0]; // Default to today
  return isoDate.split('T')[0];
};

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Get current month in YYYY-MM format
const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function TransactionsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  
  const transactionsData = useQuery(api.transactions.getTransactions, { monthYear: selectedMonth });
  const transactions = transactionsData || [];
  const categoriesData = useQuery(api.transactions.getTransactionCategories);
  const categories = categoriesData || [];
  const addTransaction = useMutation(api.transactions.addTransaction);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(formatDateForInput());
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState(""); 
  const [type, setType] = useState<"income" | "expense">("expense");

  const openModalForCreate = () => {
    setDescription("");
    setAmount("");
    setDate(formatDateForInput()); 
    setCategory(categories.length > 0 ? categories[0] : "");
    setNewCategory("");
    setType("expense"); // Default to expense
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || (!category && !newCategory)) {
      toast.error("Please fill in all required fields: Description, Amount, Date, and Category.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Amount must be a positive number.");
      return;
    }

    const finalCategory = newCategory.trim() || category;
    if (!finalCategory) {
        toast.error("Category cannot be empty.");
        return;
    }

    try {
      await addTransaction({
        description,
        amount: parsedAmount,
        date, 
        category: finalCategory,
        type, // Use the selected type
      });
      toast.success(`Transaction (${type}) added successfully!`);
      closeModal();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      toast.error("Failed to add transaction. " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  const allTransactionsForMonthCalc = useQuery(api.transactions.getTransactions, {});
  const uniqueMonths = useMemo(() => {
    if (!allTransactionsForMonthCalc) return [getCurrentMonthYear()];
    const months = new Set(allTransactionsForMonthCalc.map(t => t.date.substring(0, 7)));
    if (!months.has(getCurrentMonthYear())) {
      months.add(getCurrentMonthYear());
    }
    return Array.from(months).sort().reverse();
  }, [allTransactionsForMonthCalc]);


  if (transactionsData === undefined || categoriesData === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">My Transactions</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="monthSelector" className="text-sm font-medium text-gray-700">Month:</label>
          <select 
            id="monthSelector"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          >
            {uniqueMonths.map(month => (
              <option key={month} value={month}>{new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</option>
            ))}
          </select>
          <button
            onClick={openModalForCreate}
            className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary-hover transition duration-150"
          >
            Add Transaction
          </button>
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl shadow">
          <p className="text-xl text-gray-600">No transactions recorded for {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}.</p>
          <p className="text-gray-500">Click "Add Transaction" to log your spending or income.</p>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className={`${transaction.type === 'income' ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'} transition-colors duration-150`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(transaction.date + "T00:00:00Z").toLocaleDateString(undefined, { timeZone: 'UTC' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ($)*</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="e.g., 50.75"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type*</label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as "income" | "expense")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== "new") setNewCategory(""); 
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary mb-2"
                  disabled={!!newCategory.trim()} 
                >
                  <option value="">-- Select Existing --</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="new">-- Add New Category --</option>
                </select>
                {(category === "new" || newCategory.trim()) && (
                  <input
                    type="text"
                    id="newCategory"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  />
                )}
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
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
