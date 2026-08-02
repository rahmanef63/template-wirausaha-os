import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./_shared/auth";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaCatalog").take(500),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaCatalog")),
    productId: v.optional(v.string()),
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    priceLabel: v.string(),
    price: v.optional(v.number()),
    blurb: v.string(),
    badge: v.optional(v.string()),
    emoji: v.string(),
    gradient: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    await requireUser(ctx);
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaCatalog", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaCatalog") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
  },
});
