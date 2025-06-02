import React, { useState, FormEvent, useEffect } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Doc } from '../convex/_generated/dataModel';
import { toast } from 'sonner';

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function FinancialStrategiesPage() {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingProjection, setIsLoadingProjection] = useState<string | null>(null); // Store goalId being loaded

  const askAI = useAction(api.ai.askFinancialQuestion);
  const getProjection = useAction(api.ai.getSavingsProjectionForGoal);
  const checkApiKey = useAction(api.ai.checkApiKeyStatus);

  const goals = useQuery(api.goals.getGoals) || [];
  // Fetch transactions and budgets for context (can be optimized later if needed)
  const [selectedMonth] = useState(getCurrentMonthYear());
  const transactions = useQuery(api.transactions.getTransactions, { monthYear: selectedMonth }) || [];
  const budgets = useQuery(api.budgets.getBudgetSummary, { monthYear: selectedMonth }) || [];


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const newUserMessage = { role: "user" as const, content: userMessage };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserMessage("");
    setIsLoadingAI(true);

    try {
      const response = await askAI({
        message: userMessage,
        goals: goals as Doc<"goals">[], // Cast needed if types don't perfectly align
        transactions: transactions as Doc<"transactions">[],
        budgets: budgets as (Doc<"budgets"> & { spentAmount: number; remainingAmount: number; })[],
      });
      if (response) {
        setChatHistory(prev => [...prev, { role: "assistant" as const, content: response }]);
      } else {
        toast.error("The AI didn't provide a response. Please try again.");
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast.error("Error getting financial advice. " + (error instanceof Error ? error.message : String(error)));
      setChatHistory(prev => [...prev, { role: "assistant" as const, content: "Sorry, I couldn't process that request right now." }]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleGetProjection = async (goal: Doc<"goals">) => {
    setIsLoadingProjection(goal._id);
    setChatHistory(prev => [...prev, {role: "user", content: `Can you show me a savings projection for my goal: "${goal.name}"?`}]);
    try {
      const projection = await getProjection({
        goalId: goal._id,
        goalName: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
      });
       if (projection) {
        setChatHistory(prev => [...prev, { role: "assistant" as const, content: projection }]);
      } else {
        toast.error("The AI didn't provide a projection. Please try again.");
      }
    } catch (error) {
      console.error("Failed to get projection:", error);
      toast.error("Error getting savings projection. " + (error instanceof Error ? error.message : String(error)));
       setChatHistory(prev => [...prev, { role: "assistant" as const, content: "Sorry, I couldn't generate a projection for that goal right now." }]);
    } finally {
      setIsLoadingProjection(null);
    }
  };
  
    // Scroll to bottom of chat on new message
  useEffect(() => {
    const chatOutput = document.getElementById('chat-output');
    if (chatOutput) {
      chatOutput.scrollTop = chatOutput.scrollHeight;
    }
  }, [chatHistory]);


  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)]">
      {/* AI Chat Section */}
      <div className="flex-1 flex flex-col bg-white p-6 rounded-xl shadow-lg max-h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-primary">AI Financial Advisor</h2>
          <button
            onClick={async () => {
              try {
                const status = await checkApiKey();
                toast.info(`API Key Status: ${status.hasUserKey ? 'Your key (' + status.keyPrefix + ')' : 'Using fallback'}`);
              } catch (error) {
                toast.error('Failed to check API key status');
              }
            }}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Check API Key
          </button>
        </div>
        <div id="chat-output" className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xl px-4 py-2 rounded-lg shadow ${
                  chat.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {chat.content.split('\\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>
          ))}
          {isLoadingAI && (
            <div className="flex justify-start">
              <div className="max-w-xl px-4 py-2 rounded-lg shadow bg-gray-100 text-gray-800">
                <div className="animate-pulse flex space-x-2">
                  <div className="rounded-full bg-gray-300 h-2 w-2"></div>
                  <div className="rounded-full bg-gray-300 h-2 w-2"></div>
                  <div className="rounded-full bg-gray-300 h-2 w-2"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Ask a financial question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            disabled={isLoadingAI}
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary-hover transition duration-150 disabled:opacity-50"
            disabled={isLoadingAI || !userMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>

      {/* Goals Projection Section */}
      <div className="w-full md:w-96 bg-white p-6 rounded-xl shadow-lg overflow-y-auto max-h-full">
        <h2 className="text-2xl font-semibold text-primary mb-4">Goal Projections</h2>
        {goals.length === 0 && (
          <p className="text-gray-600">You don't have any goals set up yet. Add some goals on the 'Goals' page to see projections here.</p>
        )}
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal._id} className="p-4 border rounded-lg bg-slate-50">
              <h3 className="font-semibold text-lg text-gray-800">{goal.name}</h3>
              <p className="text-sm text-gray-600">Target: ${goal.targetAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Saved: ${goal.currentAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Deadline: {new Date(goal.targetDate + "T00:00:00Z").toLocaleDateString()}</p>
              <button
                onClick={() => handleGetProjection(goal)}
                disabled={isLoadingProjection === goal._id || isLoadingAI}
                className="mt-2 w-full bg-accent text-white px-4 py-1.5 rounded-md hover:bg-accent-hover transition duration-150 text-sm disabled:opacity-60"
              >
                {isLoadingProjection === goal._id ? (
                  <span className="animate-pulse">Calculating...</span>
                ) : (
                  "Get Savings Projection"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
