import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./_shared/auth";

const STATUS = v.union(v.literal("active"), v.literal("paused"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaBusinesses").take(200),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaBusinesses")),
    name: v.string(),
    type: v.string(),
    city: v.string(),
    staffCount: v.number(),
    monthlyRevenue: v.number(),
    status: STATUS,
  },
  handler: async (ctx, { id, ...data }) => {
    await requireUser(ctx);
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaBusinesses", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaBusinesses") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
  },
});
