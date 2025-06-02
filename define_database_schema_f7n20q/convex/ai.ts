"use node";
import OpenAI from "openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ActionCtx } from "./_generated/server";

// Use user's OpenAI API key if available, otherwise fall back to Convex's
const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_KEY ? "https://api.openai.com/v1" : process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY || process.env.CONVEX_OPENAI_API_KEY,
});

type GoalArg = Doc<"goals">;
type TransactionArg = Doc<"transactions">;
type BudgetArg = Doc<"budgets"> & { spentAmount: number; remainingAmount: number };


export const askFinancialQuestion = action({
  args: {
    message: v.string(),
    goals: v.array(
      v.object({
        _id: v.id("goals"),
        userId: v.id("users"),
        _creationTime: v.number(),
        name: v.string(),
        targetAmount: v.number(),
        currentAmount: v.number(),
        targetDate: v.string(),
        description: v.optional(v.string()),
      })
    ),
    transactions: v.array(
      v.object({
        _id: v.id("transactions"),
        userId: v.id("users"),
        _creationTime: v.number(),
        description: v.string(),
        amount: v.number(),
        date: v.string(),
        category: v.string(),
        type: v.union(v.literal("income"), v.literal("expense")),
      })
    ),
    budgets: v.array(
      v.object({
        _id: v.id("budgets"),
        userId: v.id("users"),
        _creationTime: v.number(),
        category: v.string(),
        allocatedAmount: v.number(),
        monthYear: v.string(),
        spentAmount: v.number(), 
        remainingAmount: v.number(),
      })
    ),
  },
  handler: async (ctx: ActionCtx, args: { message: string; goals: GoalArg[]; transactions: TransactionArg[]; budgets: BudgetArg[] }): Promise<string | null> => {
    const user: Doc<"users"> | null = await ctx.runQuery(api.auth.loggedInUser);
    if (!user) {
      throw new Error("User not authenticated to ask AI.");
    }

    let systemPrompt: string = `You are a friendly and helpful financial assistant for a student.
    Your goal is to provide concise, actionable advice.
    The user's name is ${user.name || "there"}.
    Today's date is ${new Date().toLocaleDateString()}.
    Keep your responses relatively short and to the point, suitable for a chat interface.
    Focus on practical tips a student can implement.`;

    if (args.goals.length > 0) {
      systemPrompt += "\n\nHere are the user's current financial goals:\n";
      args.goals.forEach(goal => {
        systemPrompt += `- Goal: ${goal.name}, Target: $${goal.targetAmount}, Saved: $${goal.currentAmount}, Deadline: ${goal.targetDate}\n`;
      });
    }
    if (args.budgets.length > 0) {
      systemPrompt += "\n\nHere is the user's budget summary for the current/selected month:\n";
      args.budgets.forEach(budget => {
        systemPrompt += `- Category: ${budget.category}, Allocated: $${budget.allocatedAmount}, Spent: $${budget.spentAmount}\n`;
      });
    }
     if (args.transactions.length > 0) {
      systemPrompt += "\n\nHere are some of the user's recent transactions (last 5 shown):\n";
      args.transactions.slice(0, 5).forEach(t => {
        systemPrompt += `- ${t.date}: ${t.description} (${t.type}) - $${t.amount} [Category: ${t.category}]\n`;
      });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "gpt-4.1-nano",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: args.message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      return completion.choices[0].message.content;
    } catch (error: any) {
      if (error.status === 401 || error.status === 429 || error.message?.includes("no requests remaining") || error.message?.includes("API key") || error.message?.includes("quota")) {
        return "I'm sorry, but the AI service is currently unavailable due to quota limits. Please set up your own OpenAI API key in the environment variables. You can get an API key at https://platform.openai.com and add it as OPENAI_API_KEY in your Convex deployment settings.";
      }
      throw error;
    }
  },
});


export const checkApiKeyStatus = action({
  args: {},
  handler: async (ctx: ActionCtx): Promise<{ hasUserKey: boolean; keyPrefix: string }> => {
    const userKey = process.env.OPENAI_API_KEY;
    return {
      hasUserKey: !!userKey,
      keyPrefix: userKey ? userKey.substring(0, 7) + "..." : "none"
    };
  },
});

export const getSavingsProjectionForGoal = action({
  args: {
    goalId: v.id("goals"),
    goalName: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    targetDate: v.string(),
  },
  handler: async (ctx: ActionCtx, args: { goalId: Id<"goals">, goalName: string, targetAmount: number, currentAmount: number, targetDate: string }): Promise<string | null> => {
    const user: Doc<"users"> | null = await ctx.runQuery(api.auth.loggedInUser);
    if (!user) {
      throw new Error("User not authenticated to ask AI.");
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const deadline = new Date(args.targetDate + "T00:00:00Z"); // Ensure UTC for deadline
    
    if (deadline <= today) {
      return `The deadline for your goal "${args.goalName}" (${args.targetDate}) has already passed or is today. Please set a future date to get a savings projection.`;
    }

    const amountNeeded = args.targetAmount - args.currentAmount;
    if (amountNeeded <= 0) {
      return `Congratulations! You've already reached your goal "${args.goalName}"!`;
    }

    const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksRemaining = daysRemaining / 7;
    const monthsRemaining = daysRemaining / 30.44; // Average days in a month

    const dailySavings = amountNeeded / daysRemaining;
    const weeklySavings = amountNeeded / weeksRemaining;
    const monthlySavings = amountNeeded / monthsRemaining;

    const prompt: string = `The user, ${user.name || "a student"}, wants to save for their goal: "${args.goalName}".
    They need to save $${amountNeeded.toFixed(2)}.
    Their deadline is ${args.targetDate} (${daysRemaining} days from now).

    Calculate and present the daily, weekly, and monthly savings needed.
    Keep the response concise and encouraging.
    For example: "To reach your goal of $${args.targetAmount} for '${args.goalName}' by ${args.targetDate}, you could save:
    - $X.XX per day
    - $Y.YY per week
    - $Z.ZZ per month
    Keep it up!"

    Daily: $${dailySavings.toFixed(2)}
    Weekly: $${weeklySavings.toFixed(2)}
    Monthly: $${monthlySavings.toFixed(2)}
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "gpt-4.1-nano",
        messages: [
          { role: "system", content: "You are a helpful financial assistant. Provide a concise savings projection based on the user's goal details." },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });
      return completion.choices[0].message.content;
    } catch (error: any) {
      if (error.status === 401 || error.status === 429 || error.message?.includes("no requests remaining") || error.message?.includes("API key") || error.message?.includes("quota")) {
        return `To reach "${args.goalName}" (${args.targetAmount}) by ${args.targetDate}:\n• Daily: ${dailySavings.toFixed(2)}\n• Weekly: ${weeklySavings.toFixed(2)}\n• Monthly: ${monthlySavings.toFixed(2)}\n\nNote: Set up OpenAI API key for enhanced AI features.`;
      }
      throw error;
    }
  }
});
