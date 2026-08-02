import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./_shared/auth";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaJournal").order("desc").take(200),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaJournal")),
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: v.string(),
    author: v.string(),
    publishedAt: v.number(),
    emoji: v.string(),
    gradient: v.string(),
  },
  handler: async (ctx, { id, ...data }) => {
    await requireUser(ctx);
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaJournal", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaJournal") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
  },
});
