import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { commentsTables } from "./features/comments/_schema";
import { notionTables } from "./features/notion/_schema";
import { paymentTables } from "./features/payment/_schema";

// Wirausaha OS — full schema (Convex target).
// authTables = @convex-dev/auth. Content tables mirror the localStorage shape
// the frontend store used, so the Convex-backed store adapter maps 1:1.
export default defineSchema({
  ...authTables,

  // Fixed-window rate-limit counters for anonymous public mutations. Additive +
  // empty on deploy; rows reused in place per key. See convex/_shared/rateLimit.ts.
  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  }).index("by_key", ["key"]),
  ...commentsTables,
  ...notionTables,
  // DOKU/Midtrans payment orders + webhook events (guest checkout).
  ...paymentTables,

  wirausahaBusinesses: defineTable({
    name: v.string(),
    type: v.string(),
    city: v.string(),
    staffCount: v.number(),
    monthlyRevenue: v.number(),
    status: v.union(v.literal("active"), v.literal("paused")),
  }).index("by_status", ["status"]),

  wirausahaProducts: defineTable({
    businessId: v.string(),
    name: v.string(),
    sku: v.string(),
    priceLabel: v.string(),
    stock: v.number(),
    unit: v.string(),
    // icon-picker / image-picker slice values (optional, additive).
    icon: v.optional(v.string()),
    image: v.optional(v.string()),
  }).index("by_business", ["businessId"]),

  wirausahaOrders: defineTable({
    businessId: v.string(),
    customerId: v.string(),
    // Public tracking + payment link id (unguessable; doubles as the guest
    // capability token for /order/[id] and joins paymentOrders.orderId).
    orderId: v.optional(v.string()),
    // Guest buyer contact captured at checkout.
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
        // Additive (checkout fills these; legacy/admin rows may omit).
        name: v.optional(v.string()),
        price: v.optional(v.number()),
      }),
    ),
    totalLabel: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    ts: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_orderId", ["orderId"]),

  wirausahaCustomers: defineTable({
    name: v.string(),
    phone: v.string(),
    city: v.string(),
    totalSpentLabel: v.string(),
    orderCount: v.number(),
  }),

  wirausahaFinance: defineTable({
    businessId: v.string(),
    kind: v.union(v.literal("income"), v.literal("expense")),
    category: v.string(),
    amountLabel: v.string(),
    note: v.string(),
    ts: v.number(),
  }).index("by_business", ["businessId"]),

  wirausahaStaff: defineTable({
    businessId: v.string(),
    name: v.string(),
    role: v.string(),
    phone: v.string(),
    joinedAt: v.number(),
  }).index("by_business", ["businessId"]),

  wirausahaCatalog: defineTable({
    productId: v.optional(v.string()),
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    priceLabel: v.string(),
    // Numeric unit price (IDR) for checkout — additive; checkout falls back
    // to parsing priceLabel digits when absent.
    price: v.optional(v.number()),
    blurb: v.string(),
    badge: v.optional(v.string()),
    emoji: v.string(),
    gradient: v.string(),
    image: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  wirausahaStores: defineTable({
    name: v.string(),
    businessId: v.optional(v.string()),
    city: v.string(),
    address: v.string(),
    phone: v.string(),
    hours: v.string(),
    mapsUrl: v.optional(v.string()),
    emoji: v.string(),
    gradient: v.string(),
  }),

  wirausahaJournal: defineTable({
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: v.string(),
    author: v.string(),
    publishedAt: v.number(),
    emoji: v.string(),
    gradient: v.string(),
  }).index("by_slug", ["slug"]),

  wirausahaReviews: defineTable({
    author: v.string(),
    city: v.string(),
    category: v.string(),
    storeId: v.optional(v.string()),
    rating: v.number(),
    body: v.string(),
    emoji: v.string(),
    publishedAt: v.number(),
  }),

  wirausahaPromotions: defineTable({
    code: v.string(),
    label: v.string(),
    kind: v.union(v.literal("percent"), v.literal("rupiah")),
    value: v.number(),
    startAt: v.number(),
    endAt: v.number(),
    usageLimit: v.number(),
    usedCount: v.number(),
    targetSku: v.optional(v.string()),
    targetCategory: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("scheduled"),
      v.literal("expired"),
      v.literal("paused"),
    ),
  }).index("by_status", ["status"]),

  wirausahaSuppliers: defineTable({
    name: v.string(),
    contactPerson: v.string(),
    phone: v.string(),
    city: v.string(),
    leadTimeDays: v.number(),
    terms: v.string(),
    category: v.string(),
    linkedSkus: v.array(v.string()),
    note: v.optional(v.string()),
  }),

  subscribers: defineTable({
    email: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("unsubscribed")),
    source: v.string(),
    ts: v.number(),
  }).index("by_email", ["email"]),

  // Page-builder + landing: complex nested structures stored as blobs keyed by
  // the frontend's string id (PageEntry.id / LandingSection.id).
  pages: defineTable({
    entryId: v.string(),
    slug: v.string(),
    data: v.any(),
  })
    .index("by_entryId", ["entryId"])
    .index("by_slug", ["slug"]),

  landingSections: defineTable({
    sectionId: v.string(),
    data: v.any(),
  }).index("by_sectionId", ["sectionId"]),

  // Singleton site config — onboarding wizard + admin Settings write this.
  siteSettings: defineTable({
    siteName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactAddress: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    themeDefault: v.optional(v.string()),
    themePreset: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    socials: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    analyticsId: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
  }),

  // Public contact-form inquiries (anon-writable, admin-readable).
  wirausahaLeads: defineTable({
    name: v.string(),
    whatsapp: v.optional(v.string()),
    email: v.optional(v.string()),
    topic: v.optional(v.string()),
    message: v.string(),
    source: v.string(),
    ts: v.number(),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("closed")),
  }).index("by_status_ts", ["status", "ts"]),

  // Admin-panel "AI config" block. Singleton row holding the active model +
  // sampling config (mirrors the AiConfig type). One row.
  adminAiConfig: defineTable({
    activeModelId: v.string(),
    systemPrompt: v.string(),
    temperature: v.number(),
    maxOutputTokens: v.number(),
  }),

  // Admin-panel "AI config" moderation rules. One row per rule, keyed by the
  // frontend's stable string id (ModerationRule.id).
  adminModerationRules: defineTable({
    ruleId: v.string(),
    label: v.string(),
    description: v.string(),
    enabled: v.boolean(),
    threshold: v.optional(v.number()),
  }).index("by_ruleId", ["ruleId"]),

  // Admin-panel "Settings" block — WORKSPACE settings (distinct from the
  // public siteSettings singleton). Identity = one row; integrations + apiKeys
  // = one row each keyed by their stable frontend string id.
  adminWorkspaceSettings: defineTable({
    name: v.string(),
    slug: v.string(),
    timezone: v.string(),
    language: v.string(),
    contactEmail: v.string(),
  }),

  adminIntegrations: defineTable({
    integrationId: v.string(),
    label: v.string(),
    category: v.union(
      v.literal("messaging"),
      v.literal("email"),
      v.literal("payments"),
      v.literal("deploy"),
      v.literal("vcs"),
    ),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("error"),
    ),
    detail: v.string(),
    docsUrl: v.string(),
  }).index("by_integrationId", ["integrationId"]),

  adminApiKeys: defineTable({
    keyId: v.string(),
    label: v.string(),
    tail: v.string(),
    createdAt: v.string(),
    lastUsedAt: v.optional(v.string()),
    scope: v.union(v.literal("read"), v.literal("read-write"), v.literal("admin")),
  }).index("by_keyId", ["keyId"]),

  // Admin-panel "Webhooks" block — endpoints + deliveries (auth-guarded). Keyed
  // by a stable frontend string id (whId / dlId) so the binding's `id: string`
  // contract holds without leaking Convex _id into the view.
  adminWebhooks: defineTable({
    whId: v.string(),
    url: v.string(),
    description: v.string(),
    events: v.array(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("failing"),
    ),
    secretTail: v.string(),
    lastDeliveryAt: v.union(v.string(), v.null()),
    failingRetries: v.number(),
  }).index("by_whId", ["whId"]),

  adminWebhookDeliveries: defineTable({
    dlId: v.string(),
    endpointId: v.string(), // the endpoint's whId
    event: v.string(),
    at: v.string(),
    httpCode: v.number(),
    status: v.union(
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("pending"),
      v.literal("retry"),
    ),
    durationMs: v.number(),
    attempt: v.number(),
  }).index("by_endpointId", ["endpointId"]),

  // Admin-panel "Audit log" block — real admin-activity stream. Rows are
  // appended by the other admin mutations (users.changeRole/revoke,
  // webhooks.add/remove/fire, aiConfig.setConfig/reset, settings.setIdentity/
  // revokeKey) via the shared logAudit() helper. Keyed by a stable frontend
  // string id (evId) so the binding's `id: string` contract holds.
  adminAuditEvents: defineTable({
    evId: v.string(),
    at: v.string(), // ISO datetime
    actorId: v.string(),
    actorName: v.string(),
    actorInitials: v.string(),
    actorRole: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer"),
      v.literal("system"),
    ),
    action: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("publish"),
      v.literal("unpublish"),
      v.literal("invite"),
      v.literal("revoke"),
      v.literal("login"),
      v.literal("logout"),
      v.literal("export"),
    ),
    entityType: v.union(
      v.literal("page"),
      v.literal("user"),
      v.literal("role"),
      v.literal("webhook"),
      v.literal("setting"),
      v.literal("post"),
      v.literal("workflow"),
      v.literal("session"),
    ),
    entityId: v.string(),
    entityLabel: v.string(),
    severity: v.union(v.literal("info"), v.literal("warn"), v.literal("alert")),
    diffSummary: v.optional(v.string()),
  }).index("by_at", ["at"]),

  // Admin-panel "Users" block — role mapping over the @convex-dev/auth `users`
  // table (which stays untouched). One row per user whose role has been changed
  // from the derived default. revoke = delete the row (user drops to default).
  adminRoles: defineTable({
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("editor"),
      v.literal("viewer"),
    ),
  }).index("by_userId", ["userId"]),
});
