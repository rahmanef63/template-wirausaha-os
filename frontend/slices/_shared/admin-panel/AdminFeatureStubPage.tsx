import { notFound } from "next/navigation";
import { IS_DEMO } from "@/lib/stage";
import { AdminFeatureCard } from "./AdminFeatureCard";
import { ADMIN_PANEL_BLOCKS } from "./feature-blocks";
import { UsersBlockConvex } from "./blocks/users/UsersBlockConvex";
import { AuditLogBlockConvex } from "./blocks/audit-log/AuditLogBlockConvex";
import { AiConfigBlockConvex } from "./blocks/ai-config/AiConfigBlockConvex";
import { AnalyticsBlockConvex } from "./blocks/analytics/AnalyticsBlockConvex";
import { WebhooksBlockConvex } from "./blocks/webhooks/WebhooksBlockConvex";
import { SettingsBlockConvex } from "./blocks/settings/SettingsBlockConvex";
import { UsersBlockView } from "./blocks/users/UsersBlockView";
import { AuditLogBlockView } from "./blocks/audit-log/AuditLogBlockView";
import { AiConfigBlockView } from "./blocks/ai-config/AiConfigBlockView";
import { AnalyticsBlockView } from "./blocks/analytics/AnalyticsBlockView";
import { WebhooksBlockView } from "./blocks/webhooks/WebhooksBlockView";
import { SettingsBlockView } from "./blocks/settings/SettingsBlockView";

/**
 * BG-wave — shared stub renderer used by every per-template admin
 * panel feature route. Each template's
 * `/dashboard/admin/admin-panel/<segment>/page.tsx` just calls
 * `<AdminFeatureStubPage segment="ai-config" />` — no per-template
 * duplication.
 *
 * BS-canary → BX-wave (2026-05-20 → 2026-05-21) — all 6 admin-panel
 * blocks now have real implementations. AdminFeatureCard is retained
 * as the fallback for future segments added to ADMIN_PANEL_BLOCKS
 * before a real view ships.
 */
export function AdminFeatureStubPage({ segment }: { segment: string }) {
  const block = ADMIN_PANEL_BLOCKS.find((b) => b.segment === segment);
  if (!block) notFound();
  // PUBLIC-demo isolation: render the BARE *BlockView, which falls back to the
  // in-memory useDefault*Bindings — so visitor edits stay per-session and never
  // touch the shared demo Convex DB. Pure no-op when NEXT_PUBLIC_DEMO !== "1".
  if (IS_DEMO) {
    if (segment === "users") return <UsersBlockView />;
    if (segment === "audit-log") return <AuditLogBlockView />;
    if (segment === "ai-config") return <AiConfigBlockView />;
    if (segment === "analytics") return <AnalyticsBlockView />;
    if (segment === "webhooks") return <WebhooksBlockView />;
    if (segment === "settings") return <SettingsBlockView />;
  }
  if (segment === "users") return <UsersBlockConvex />;
  if (segment === "audit-log") return <AuditLogBlockConvex />;
  if (segment === "ai-config") return <AiConfigBlockConvex />;
  if (segment === "analytics") return <AnalyticsBlockConvex />;
  if (segment === "webhooks") return <WebhooksBlockConvex />;
  if (segment === "settings") return <SettingsBlockConvex />;
  return <AdminFeatureCard block={block} />;
}
