import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  goals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    targetDate: v.string(), // Using string for simplicity, can be ISO date string
    description: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  transactions: defineTable({
    userId: v.id("users"),
    description: v.string(),
    amount: v.number(),
    date: v.string(), // Using string for simplicity, can be ISO date string
    category: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")), // 'income' or 'expense'
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_category", ["userId", "category"]),

  budgets: defineTable({
    userId: v.id("users"),
    category: v.string(),
    allocatedAmount: v.number(),
    // spentAmount will be calculated dynamically or updated via a mutation when a transaction is added
    monthYear: v.string(), // e.g., "2024-07"
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_monthYear", ["userId", "monthYear"])
    .index("by_userId_and_category_and_monthYear", ["userId", "category", "monthYear"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
