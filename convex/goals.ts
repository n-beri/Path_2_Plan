import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const createGoal = mutation({
  args: {
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    targetDate: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const goalId = await ctx.db.insert("goals", {
      userId,
      name: args.name,
      targetAmount: args.targetAmount,
      currentAmount: args.currentAmount,
      targetDate: args.targetDate,
      description: args.description,
    });
    return goalId;
  },
});

export const getGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return []; // Or throw new Error("User not authenticated");
    }
    return await ctx.db
      .query("goals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    name: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    currentAmount: v.optional(v.number()),
    targetDate: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const { goalId, ...rest } = args;
    const existingGoal = await ctx.db.get(goalId);
    if (!existingGoal || existingGoal.userId !== userId) {
      throw new Error("Goal not found or user not authorized");
    }
    await ctx.db.patch(goalId, rest);
    return goalId;
  },
});

export const deleteGoal = mutation({
  args: {
    goalId: v.id("goals"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const existingGoal = await ctx.db.get(args.goalId);
    if (!existingGoal || existingGoal.userId !== userId) {
      throw new Error("Goal not found or user not authorized");
    }
    await ctx.db.delete(args.goalId);
    return args.goalId;
  },
});
