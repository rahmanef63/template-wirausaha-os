// Guest checkout — catalog cart → priced server-side → DOKU Direct payment
// → wirausahaOrders record. The client's subtotal is DISPLAY ONLY; this file
// re-prices every line from wirausahaCatalog so a tampered client can never
// set its own amount.

import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { limitPublicWrite } from "./_shared/rateLimit";

const itemsArg = v.array(
  v.object({ slug: v.string(), qty: v.number() }),
);

const customerArg = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
});

const MAX_QTY = 99;

/** "Rp 22.000" / "Rp 7.000 / kg" → 22000 / 7000. Null when no digits. */
function parseIDR(label: string): number | null {
  const digits = label.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export const priceItems = internalQuery({
  args: { items: itemsArg },
  handler: async (ctx, { items }) => {
    const lines = [];
    for (const item of items) {
      const doc = await ctx.db
        .query("wirausahaCatalog")
        .withIndex("by_slug", (q) => q.eq("slug", item.slug))
        .first();
      if (!doc) throw new Error(`Produk tidak ditemukan: ${item.slug}`);
      const price = doc.price ?? parseIDR(doc.priceLabel);
      if (!price) throw new Error(`Harga tidak valid untuk: ${doc.name}`);
      const qty = Math.max(1, Math.min(MAX_QTY, Math.round(item.qty)));
      lines.push({
        slug: doc.slug,
        productId: doc.productId ?? doc.slug,
        name: doc.name,
        qty,
        price,
        priceLabel: doc.priceLabel,
      });
    }
    return lines;
  },
});

// Rate-limit hop for the public placeOrder action (actions have no ctx.db).
// Per-email cap + global flood cap, so anon can't spam order/payment creation.
export const checkRateLimit = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    await limitPublicWrite(ctx, "checkout", email);
  },
});

export const recordOrder = internalMutation({
  args: {
    orderId: v.string(),
    customer: customerArg,
    lines: v.array(
      v.object({
        slug: v.string(),
        productId: v.string(),
        name: v.string(),
        qty: v.number(),
        price: v.number(),
        priceLabel: v.string(),
      }),
    ),
    total: v.number(),
  },
  handler: async (ctx, { orderId, customer, lines, total }) => {
    const customerId = await ctx.db.insert("wirausahaCustomers", {
      name: customer.name,
      phone: customer.phone ?? "-",
      city: "-",
      totalSpentLabel: formatIDR(total),
      orderCount: 1,
    });
    await ctx.db.insert("wirausahaOrders", {
      businessId: "biz-1",
      customerId: customerId as string,
      orderId,
      buyer: customer,
      items: lines.map((l) => ({
        productId: l.productId,
        qty: l.qty,
        priceLabel: l.priceLabel,
        name: l.name,
        price: l.price,
      })),
      totalLabel: formatIDR(total),
      status: "new",
      ts: Date.now(),
    });
  },
});

/**
 * Public order tracking — the unguessable orderId is the capability token
 * (same model as payment.query.getOrderByOrderId). Joins the domain order
 * (items, fulfilment status) with the payment row (payment status +
 * instructions) so /order/[id] survives reloads and updates reactively
 * when the webhook flips the payment to paid.
 */
export const trackOrder = query({
  args: { orderId: v.string() },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db
      .query("wirausahaOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .unique();
    if (!order) return null;
    const payment = await ctx.db
      .query("paymentOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .unique();
    return {
      orderId,
      status: order.status,
      totalLabel: order.totalLabel,
      ts: order.ts,
      buyerName: order.buyer?.name ?? null,
      items: order.items.map((i) => ({
        name: i.name ?? i.productId,
        qty: i.qty,
        priceLabel: i.priceLabel,
        price: i.price ?? null,
      })),
      payment: payment
        ? {
            status: payment.status,
            amount: payment.amount,
            channel: payment.paymentChannel ?? null,
            instructions: payment.paymentInstructions ?? null,
            checkoutUrl: payment.checkoutUrl ?? null,
            expiresAt: payment.expiresAt ?? null,
            paidAt: payment.paidAt ?? null,
          }
        : null,
    };
  },
});

type PlaceOrderResult =
  | {
      ok: true;
      orderId: string;
      amount: number;
      instructions: unknown;
      expiresAt?: number;
    }
  | { ok: false; notice: string };

export const placeOrder = action({
  args: {
    items: itemsArg,
    customer: customerArg,
    channel: v.string(),
  },
  handler: async (ctx, args): Promise<PlaceOrderResult> => {
    if (args.items.length === 0) {
      return { ok: false, notice: "Keranjang kosong." };
    }

    try {
      await ctx.runMutation(internal.checkout.checkRateLimit, {
        email: args.customer.email,
      });
    } catch {
      return {
        ok: false,
        notice: "Terlalu banyak percobaan checkout. Coba lagi sebentar.",
      };
    }

    const lines = await ctx.runQuery(internal.checkout.priceItems, {
      items: args.items,
    });
    const amount = lines.reduce(
      (sum: number, l: { price: number; qty: number }) => sum + l.price * l.qty,
      0,
    );

    const orderId = `WRA-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 12)
      .toUpperCase()}`;

    const payment = await ctx.runAction(
      api.features.payment.actions.doku.createDirectPayment,
      {
        orderId,
        amount,
        channel: args.channel,
        customer: args.customer,
      },
    );
    if (!payment.ok) return { ok: false, notice: payment.notice };

    await ctx.runMutation(internal.checkout.recordOrder, {
      orderId,
      customer: args.customer,
      lines,
      total: amount,
    });

    return {
      ok: true,
      orderId,
      amount,
      instructions: payment.instructions,
      expiresAt: payment.expiresAt,
    };
  },
});
