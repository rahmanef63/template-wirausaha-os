import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { optionalUser, requireUser } from "./_shared/auth";
import { limitPublicWrite } from "./_shared/rateLimit";

const STATUS = v.union(v.literal("new"), v.literal("contacted"), v.literal("closed"));

// Admin inbox of contact-form inquiries. Anon visitors can `create` (the public
// contact form); only authed admins can read/triage/delete.
export const list = query({
  args: {},
  handler: async (ctx) => {
    if (!(await optionalUser(ctx))) return [];
    return ctx.db.query("wirausahaLeads").withIndex("by_status_ts").order("desc").take(200);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    whatsapp: v.optional(v.string()),
    email: v.optional(v.string()),
    topic: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.email && !args.email.includes("@")) throw new Error("Email tidak valid");
    await limitPublicWrite(ctx, "lead", args.email ?? args.name);
    const lead = {
      name: args.name.slice(0, 200),
      whatsapp: args.whatsapp?.slice(0, 100),
      email: args.email?.slice(0, 320),
      topic: args.topic?.slice(0, 500),
      message: args.message.slice(0, 5000),
    };
    return ctx.db.insert("wirausahaLeads", {
      ...lead,
      source: "Contact form",
      ts: Date.now(),
      status: "new",
    });
  },
});

export const setStatus = mutation({
  args: { id: v.id("wirausahaLeads"), status: STATUS },
  handler: async (ctx, { id, status }) => {
    await requireUser(ctx);
    await ctx.db.patch(id, { status });
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaLeads") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
  },
});
