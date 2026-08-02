import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { optionalUser, requireUser } from "./_shared/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    if (!(await optionalUser(ctx))) return [];
    return ctx.db.query("wirausahaCustomers").take(500);
  },
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaCustomers")),
    name: v.string(),
    phone: v.string(),
    city: v.string(),
    totalSpentLabel: v.string(),
    orderCount: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    await requireUser(ctx);
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaCustomers", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaCustomers") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
  },
});
