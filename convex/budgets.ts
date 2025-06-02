import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export const setBudget = mutation({
  args: {
    category: v.string(),
    allocatedAmount: v.number(),
    monthYear: v.string(), // e.g., "2024-07"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if a budget for this category and monthYear already exists
    const existingBudget = await ctx.db
      .query("budgets")
      .withIndex("by_userId_and_category_and_monthYear", (q) =>
        q
          .eq("userId", userId)
          .eq("category", args.category)
          .eq("monthYear", args.monthYear)
      )
      .unique();

    if (existingBudget) {
      // Update existing budget
      await ctx.db.patch(existingBudget._id, {
        allocatedAmount: args.allocatedAmount,
      });
      return existingBudget._id;
    } else {
      // Create new budget
      const budgetId = await ctx.db.insert("budgets", {
        userId,
        category: args.category,
        allocatedAmount: args.allocatedAmount,
        monthYear: args.monthYear,
      });
      return budgetId;
    }
  },
});

export const getBudgets = query({
  args: {
    monthYear: v.string(), // e.g., "2024-07"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("budgets")
      .withIndex("by_userId_and_monthYear", (q) =>
        q.eq("userId", userId).eq("monthYear", args.monthYear)
      )
      .collect();
  },
});

// This query calculates the spent amount for each budget category for a given month.
export const getBudgetSummary = query({
  args: {
    monthYear: v.string(), // e.g., "2024-07"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Or throw error
      return [];
    }

    const budgetsForMonth = await ctx.db
      .query("budgets")
      .withIndex("by_userId_and_monthYear", (q) =>
        q.eq("userId", userId).eq("monthYear", args.monthYear)
      )
      .collect();

    // Fetch all transactions for the user, then filter by month and type in JS
    const allUserTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const transactionsForMonth = allUserTransactions.filter(
      (t) => t.type === "expense" && t.date.startsWith(args.monthYear)
    );
      
    const budgetSummary = budgetsForMonth.map((budget) => {
      const spentAmount = transactionsForMonth
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...budget,
        spentAmount,
        remainingAmount: budget.allocatedAmount - spentAmount,
      };
    });

    return budgetSummary;
  },
});

export const getUniqueBudgetCategoryMonths = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { categories: [], monthYears: [] };
    }
    const allBudgets = await ctx.db
      .query("budgets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const categories = new Set<string>();
    const monthYears = new Set<string>();

    allBudgets.forEach(b => {
      categories.add(b.category);
      monthYears.add(b.monthYear);
    });
    
    return {
      categories: Array.from(categories).sort(),
      monthYears: Array.from(monthYears).sort((a,b) => b.localeCompare(a)), // Sort descending
    };
  }
});
