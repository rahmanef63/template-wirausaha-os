import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { optionalUser, requireUser } from "./_shared/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    if (!(await optionalUser(ctx))) return [];
    return ctx.db.query("wirausahaStaff").take(500);
  },
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaStaff")),
    businessId: v.string(),
    name: v.string(),
    role: v.string(),
    phone: v.string(),
    joinedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    await requireUser(ctx);
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaStaff", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaStaff") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
  },
});
