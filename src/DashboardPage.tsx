import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// SVG Clip Art Components
const MoneyBagIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="60" r="35" fill="#4ade80" stroke="#16a34a" strokeWidth="2"/>
    <path d="M35 45 Q50 25 65 45" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
    <text x="50" y="68" textAnchor="middle" fontSize="24" fill="#ffffff" fontWeight="bold">$</text>
    <circle cx="42" cy="55" r="2" fill="#ffffff"/>
    <circle cx="58" cy="55" r="2" fill="#ffffff"/>
  </svg>
);

const PiggyBankIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="55" rx="30" ry="20" fill="#f472b6" stroke="#ec4899" strokeWidth="2"/>
    <circle cx="35" cy="45" r="12" fill="#f9a8d4"/>
    <circle cx="42" cy="42" r="2" fill="#1f2937"/>
    <path d="M65 45 Q75 40 80 50" stroke="#ec4899" strokeWidth="2" fill="none"/>
    <rect x="45" y="65" width="10" height="8" fill="#ec4899"/>
    <rect x="35" y="65" width="8" height="6" fill="#ec4899"/>
    <rect x="57" y="65" width="8" height="6" fill="#ec4899"/>
    <circle cx="50" cy="35" r="1" fill="#1f2937"/>
  </svg>
);

const TargetIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
    <circle cx="50" cy="50" r="30" fill="#ffffff" stroke="#f59e0b" strokeWidth="2"/>
    <circle cx="50" cy="50" r="20" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
    <circle cx="50" cy="50" r="10" fill="#ffffff" stroke="#f59e0b" strokeWidth="2"/>
    <circle cx="50" cy="50" r="5" fill="#dc2626"/>
    <path d="M20 30 L35 45 M50 10 L50 25 M80 30 L65 45" stroke="#dc2626" strokeWidth="2"/>
  </svg>
);

const ChartIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="70" width="12" height="20" fill="#3b82f6" rx="2"/>
    <rect x="32" y="55" width="12" height="35" fill="#10b981" rx="2"/>
    <rect x="49" y="40" width="12" height="50" fill="#f59e0b" rx="2"/>
    <rect x="66" y="60" width="12" height="30" fill="#ef4444" rx="2"/>
    <path d="M20 35 Q35 25 50 30 Q65 35 80 25" stroke="#6366f1" strokeWidth="3" fill="none"/>
    <circle cx="20" cy="35" r="3" fill="#6366f1"/>
    <circle cx="35" cy="28" r="3" fill="#6366f1"/>
    <circle cx="50" cy="30" r="3" fill="#6366f1"/>
    <circle cx="65" cy="32" r="3" fill="#6366f1"/>
    <circle cx="80" cy="25" r="3" fill="#6366f1"/>
  </svg>
);

const CreditCardIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="35" width="70" height="40" rx="8" fill="#6366f1" stroke="#4f46e5" strokeWidth="2"/>
    <rect x="15" y="45" width="70" height="8" fill="#1f2937"/>
    <rect x="20" y="60" width="25" height="4" fill="#e5e7eb" rx="2"/>
    <rect x="20" y="67" width="15" height="3" fill="#e5e7eb" rx="1"/>
    <circle cx="70" cy="65" r="6" fill="#fbbf24"/>
    <circle cx="75" cy="65" r="6" fill="#f59e0b"/>
  </svg>
);

const WalletIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 35 Q20 25 30 25 L70 25 Q80 25 80 35 L80 70 Q80 80 70 80 L30 80 Q20 80 20 70 Z" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2"/>
    <rect x="65" y="45" width="20" height="15" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2" rx="3"/>
    <circle cx="72" cy="52" r="2" fill="#7c3aed"/>
    <rect x="25" y="35" width="40" height="3" fill="#c4b5fd" rx="1"/>
    <rect x="25" y="42" width="35" height="2" fill="#c4b5fd" rx="1"/>
    <rect x="25" y="47" width="30" height="2" fill="#c4b5fd" rx="1"/>
  </svg>
);

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  
  // Fetch data
  const goals = useQuery(api.goals.getGoals) || [];
  const transactions = useQuery(api.transactions.getTransactions, { monthYear: selectedMonth }) || [];
  const budgets = useQuery(api.budgets.getBudgetSummary, { monthYear: selectedMonth }) || [];
  const allTransactions = useQuery(api.transactions.getTransactions, {}) || [];
  
  // Calculate unique months for selector
  const uniqueMonths = useMemo(() => {
    if (!allTransactions) return [getCurrentMonthYear()];
    const months = new Set(allTransactions.map(t => t.date.substring(0, 7)));
    if (!months.has(getCurrentMonthYear())) {
      months.add(getCurrentMonthYear());
    }
    return Array.from(months).sort().reverse();
  }, [allTransactions]);

  // Calculate financial metrics
  const monthlyIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalGoalsAmount = useMemo(() => {
    return goals.reduce((sum, g) => sum + g.targetAmount, 0);
  }, [goals]);

  const totalSaved = useMemo(() => {
    return goals.reduce((sum, g) => sum + g.currentAmount, 0);
  }, [goals]);

  const totalBudgetAllocated = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  }, [budgets]);

  const totalBudgetSpent = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  }, [budgets]);

  const netIncome = monthlyIncome - monthlyExpenses;

  // Calculate category spending for chart
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });
    return Object.entries(spending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }, [transactions]);

  const maxCategoryAmount = Math.max(...categorySpending.map(([,amount]) => amount), 1);

  if (goals === undefined || transactions === undefined || budgets === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-primary mb-2 animate-fade-in">Financial Dashboard</h1>
          <p className="text-lg text-secondary animate-fade-in-delay">Your complete financial overview</p>
        </div>
        <div className="flex items-center gap-3 animate-slide-in-right">
          <label htmlFor="monthSelector" className="text-sm font-medium text-gray-700">Month:</label>
          <select 
            id="monthSelector"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-all duration-200 hover:shadow-md"
          >
            {uniqueMonths.map(month => (
              <option key={month} value={month}>
                {new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-green-700">Monthly Income</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(monthlyIncome)}</p>
            </div>
            <MoneyBagIcon className="w-12 h-12 animate-bounce-slow" />
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up-delay-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-red-700">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(monthlyExpenses)}</p>
            </div>
            <CreditCardIcon className="w-12 h-12 animate-pulse-slow" />
          </div>
          <div className="w-full bg-red-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: monthlyIncome > 0 ? `${Math.min((monthlyExpenses / monthlyIncome) * 100, 100)}%` : '0%' }}
            ></div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${netIncome >= 0 ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100'} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up-delay-2`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-sm font-medium ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>{formatCurrency(netIncome)}</p>
            </div>
            <WalletIcon className="w-12 h-12 animate-wiggle" />
          </div>
          <div className={`w-full ${netIncome >= 0 ? 'bg-blue-200' : 'bg-orange-200'} rounded-full h-2`}>
            <div 
              className={`${netIncome >= 0 ? 'bg-blue-500' : 'bg-orange-500'} h-2 rounded-full transition-all duration-1000 ease-out`} 
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up-delay-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-purple-700">Goals Progress</p>
              <p className="text-2xl font-bold text-purple-900">{totalGoalsAmount > 0 ? Math.round((totalSaved / totalGoalsAmount) * 100) : 0}%</p>
            </div>
            <TargetIcon className="w-12 h-12 animate-spin-slow" />
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: totalGoalsAmount > 0 ? `${Math.min((totalSaved / totalGoalsAmount) * 100, 100)}%` : '0%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts and Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending by Category */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-left">
          <div className="flex items-center mb-6">
            <ChartIcon className="w-8 h-8 mr-3 animate-bounce-slow" />
            <h2 className="text-xl font-semibold text-gray-800">Top Spending Categories</h2>
          </div>
          {categorySpending.length > 0 ? (
            <div className="space-y-4">
              {categorySpending.map(([category, amount], index) => (
                <div key={category} className="animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${(amount / maxCategoryAmount) * 100}%`,
                        animationDelay: `${index * 200}ms`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500">No expense data for this month</p>
            </div>
          )}
        </div>

        {/* Goals Overview */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-right">
          <div className="flex items-center mb-6">
            <PiggyBankIcon className="w-8 h-8 mr-3 animate-wiggle" />
            <h2 className="text-xl font-semibold text-gray-800">Financial Goals</h2>
          </div>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 4).map((goal, index) => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                return (
                  <div key={goal._id} className="animate-slide-in-left" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 truncate">{goal.name}</span>
                      <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${Math.min(progress, 100)}%`,
                          animationDelay: `${index * 200}ms`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
              {goals.length > 4 && (
                <p className="text-sm text-gray-500 text-center">+{goals.length - 4} more goals</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TargetIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500">No goals set yet</p>
              <p className="text-xs text-gray-400">Create your first goal to start tracking progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up">
          <div className="flex items-center mb-6">
            <WalletIcon className="w-8 h-8 mr-3 animate-pulse-slow" />
            <h2 className="text-xl font-semibold text-gray-800">Budget Overview for {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg animate-scale-in">
              <p className="text-sm text-blue-700">Total Allocated</p>
              <p className="text-xl font-bold text-blue-900">{formatCurrency(totalBudgetAllocated)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg animate-scale-in" style={{ animationDelay: '100ms' }}>
              <p className="text-sm text-red-700">Total Spent</p>
              <p className="text-xl font-bold text-red-900">{formatCurrency(totalBudgetSpent)}</p>
            </div>
            <div className={`text-center p-4 rounded-lg animate-scale-in ${totalBudgetAllocated - totalBudgetSpent >= 0 ? 'bg-green-50' : 'bg-orange-50'}`} style={{ animationDelay: '200ms' }}>
              <p className={`text-sm ${totalBudgetAllocated - totalBudgetSpent >= 0 ? 'text-green-700' : 'text-orange-700'}`}>Remaining</p>
              <p className={`text-xl font-bold ${totalBudgetAllocated - totalBudgetSpent >= 0 ? 'text-green-900' : 'text-orange-900'}`}>
                {formatCurrency(totalBudgetAllocated - totalBudgetSpent)}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {budgets.slice(0, 5).map((budget, index) => {
              const progress = budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0;
              const isOverBudget = budget.spentAmount > budget.allocatedAmount;
              return (
                <div key={budget._id} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                    <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.allocatedAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ 
                        width: `${Math.min(progress, 100)}%`,
                        animationDelay: `${index * 200}ms`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
          <div className="flex items-center mb-6">
            <CreditCardIcon className="w-8 h-8 mr-3 animate-pulse-slow" />
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction, index) => (
              <div key={transaction._id} className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 hover:shadow-md animate-slide-in-up ${transaction.type === 'income' ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}`} style={{ animationDelay: `${index * 100}ms` }}>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.category} • {new Date(transaction.date + "T00:00:00Z").toLocaleDateString(undefined, { timeZone: 'UTC' })}</p>
                </div>
                <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
