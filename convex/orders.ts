import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { optionalUser, requireUser } from "./_shared/auth";

const STATUS = v.union(
  v.literal("new"),
  v.literal("processing"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    if (!(await optionalUser(ctx))) return [];
    return ctx.db.query("wirausahaOrders").order("desc").take(500);
  },
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaOrders")),
    businessId: v.string(),
    customerId: v.string(),
    orderId: v.optional(v.string()),
    buyer: v.optional(
      v.object({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
      }),
    ),
    items: v.array(
      v.object({
        productId: v.string(),
        qty: v.number(),
        priceLabel: v.string(),
        name: v.optional(v.string()),
        price: v.optional(v.number()),
      }),
    ),
    totalLabel: v.string(),
    status: STATUS,
    ts: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    await requireUser(ctx);
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaOrders", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaOrders") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
  },
});
