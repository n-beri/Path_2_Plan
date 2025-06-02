import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const addTransaction = mutation({
  args: {
    description: v.string(),
    amount: v.number(),
    date: v.string(),
    category: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const transactionId = await ctx.db.insert("transactions", {
      userId,
      description: args.description,
      amount: args.amount,
      date: args.date,
      category: args.category,
      type: args.type,
    });

    // If the transaction is income, update all goals' currentAmount
    if (args.type === "income" && args.amount > 0) {
      const goals = await ctx.db
        .query("goals")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();

      for (const goal of goals) {
        const newCurrentAmount = goal.currentAmount + args.amount;
        await ctx.db.patch(goal._id, {
          currentAmount: newCurrentAmount,
        });
      }
    }

    return transactionId;
  },
});

export const getTransactions = query({
  args: {
    // Optional filter by category or type, or date range
    category: v.optional(v.string()),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
    monthYear: v.optional(v.string()), // e.g., "2024-07" to filter by month
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let queryBuilder = ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId));

    if (args.category) {
      // This would be more efficient if we had an index on [userId, category, date] or similar
      // For now, we filter after fetching by userId.
      // Or, use the existing by_userId_and_category index if no date filtering is needed.
      if (!args.monthYear) { // If no monthYear, we can use the category index
        queryBuilder = ctx.db
          .query("transactions")
          .withIndex("by_userId_and_category", (q) => q.eq("userId", userId).eq("category", args.category!));
      }
    }
    
    const transactions = await queryBuilder.order("desc").collect();

    let filteredTransactions = transactions;

    if (args.type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === args.type);
    }
    
    if (args.monthYear) {
      filteredTransactions = filteredTransactions.filter(t => t.date.startsWith(args.monthYear!));
    }

    // If category was specified AND monthYear, we need to filter category post-hoc
    if (args.category && args.monthYear) {
        filteredTransactions = filteredTransactions.filter(t => t.category === args.category);
    }

    return filteredTransactions;
  },
});

export const getTransactionCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    
    const categories = new Set<string>();
    transactions.forEach(t => categories.add(t.category));
    return Array.from(categories);
  }
});
