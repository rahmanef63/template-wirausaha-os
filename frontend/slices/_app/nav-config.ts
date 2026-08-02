import {
  BarChart3,
  BookOpen,
  Building2,
  Database,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  MapPin,
  Newspaper,
  NotebookPen,
  Package,
  Receipt,
  ShoppingCart,
  Settings,
  Star,
  Store,
  Tag,
  Truck,
  Users,
  Wallet,
  Wand2,
} from "lucide-react";
import type { AdminNavGroup, AdminNavItem, FooterColumn, NavItem, User } from "@/features/_shared/types/common";
import type { State } from "./types";
import { DEFAULT_SITE_CONFIG, TEMPLATE_SLUG } from "./site-config";
import { buildCustomPageNavItems } from "@/features/_shared/pages/nav-builder";
import { buildAdminPanelNav } from "@/features/_shared/admin-panel/feature-blocks";
import { buildTemplatePaths } from "@/features/_shared/config/template-paths";

const paths = buildTemplatePaths(TEMPLATE_SLUG);
export const PUBLIC_BASE = paths.publicBase;
export const DASHBOARD_BASE = paths.dashboardBase;
export const ADMIN_PANEL_BASE = paths.adminPanelBase;
export const WORKSPACE_BASE = paths.workspaceBase;
/** @deprecated use ADMIN_PANEL_BASE */
export const ADMIN_BASE = ADMIN_PANEL_BASE;

export const PUBLIC_NAV: NavItem[] = [
  { label: "Katalog",  href: `${PUBLIC_BASE}/catalog` },
  { label: "Outlet",   href: `${PUBLIC_BASE}/stores` },
  { label: "Jurnal",   href: `${PUBLIC_BASE}/journal` },
  { label: "Testimoni",href: `${PUBLIC_BASE}/testimoni` },
  { label: "Services", href: `${PUBLIC_BASE}/services` },
  { label: "Contact",  href: `${PUBLIC_BASE}/contact` },
];

export const PUBLIC_CTA = { label: "Hubungi kami", href: `${PUBLIC_BASE}/contact` };

export const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: "Site", items: PUBLIC_NAV },
  {
    heading: "Resources",
    items: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export const FOOTER_TAGLINE = "Built with Wirausaha OS";

export const OWNER_USER: User = {
  name: DEFAULT_SITE_CONFIG.ownerName,
  role: DEFAULT_SITE_CONFIG.ownerRole,
  initials: DEFAULT_SITE_CONFIG.ownerInitials,
  email: DEFAULT_SITE_CONFIG.email,
};

export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const newOrders = state.orders.filter((o) => o.status === "new").length;
  const lowStock = state.products.filter((p) => p.stock < 20).length;
  const customPages = state.pages.filter((p) => !p.systemPage).length;
  const enabledLanding = state.landingSections.filter((s) => s.enabled).length;
  const activePromos = state.promotions.filter((p) => p.status === "active").length;
  return [
    { id: "dashboard",  label: "Dashboard",  href: ADMIN_BASE,                   icon: LayoutDashboard, count: null },
    // "Pages" parent — collapsible group bundling every content surface
    // that maps to a public page. Wirausaha OS only ships landing +
    // custom pages publicly; businesses/inventory/orders/finance/staff
    // are internal operations entities.
    {
      id: "pages",
      label: "Pages",
      href: `${ADMIN_BASE}/pages`,
      icon: Newspaper,
      count: customPages || null,
      children: [
        { id: "pages-all",     label: "All pages",    href: `${ADMIN_BASE}/pages`,   icon: Newspaper,      count: customPages || null },
        { id: "pages-landing", label: "Landing page", href: `${ADMIN_BASE}/landing`, icon: LayoutTemplate, count: enabledLanding || null },
        // BF-wave — dynamic custom pages (every admin-created page shows here).
        ...buildCustomPageNavItems(state.pages, `${ADMIN_BASE}/pages`),
      ],
    },
    { id: "businesses", label: "Businesses", href: `${ADMIN_BASE}/businesses`,   icon: Building2,       count: state.businesses.length },
    { id: "catalog",    label: "Katalog",    href: `${ADMIN_BASE}/catalog`,      icon: Store,           count: state.catalog.length },
    { id: "stores",     label: "Outlet",     href: `${ADMIN_BASE}/stores`,       icon: MapPin,          count: state.stores.length },
    { id: "journal",    label: "Jurnal",     href: `${ADMIN_BASE}/journal`,      icon: BookOpen,        count: state.journal.length },
    { id: "reviews",    label: "Testimoni",  href: `${ADMIN_BASE}/reviews`,      icon: Star,            count: state.reviews.length },
    { id: "inventory",  label: "Inventory",  href: `${ADMIN_BASE}/inventory`,    icon: Package,         count: lowStock || null },
    { id: "suppliers",  label: "Suppliers",  href: `${ADMIN_BASE}/suppliers`,    icon: Truck,           count: state.suppliers.length },
    { id: "orders",     label: "Orders",     href: `${ADMIN_BASE}/orders`,       icon: ShoppingCart,    count: newOrders || null },
    { id: "promotions", label: "Promotions", href: `${ADMIN_BASE}/promotions`,   icon: Tag,             count: activePromos || null },
    { id: "customers",  label: "Customers",  href: `${ADMIN_BASE}/customers`,    icon: Users,           count: state.customers.length },
    { id: "leads",      label: "Leads",      href: `${ADMIN_BASE}/leads`,        icon: Inbox,           count: null },
    { id: "subscribers", label: "Subscribers", href: `${ADMIN_BASE}/subscribers`, icon: Mail,           count: null },
    { id: "finance",    label: "Finance",    href: `${ADMIN_BASE}/finance`,      icon: Wallet,          count: null },
    { id: "analytics",  label: "Analytics",  href: `${ADMIN_BASE}/analytics`,    icon: BarChart3,       count: null },
    { id: "staff",      label: "Staff",      href: `${ADMIN_BASE}/staff`,        icon: Receipt,         count: state.staff.length },
    { id: "notes",      label: "Notes",      href: `${ADMIN_BASE}/notes`,        icon: NotebookPen,     count: null },
    { id: "database",   label: "Database",   href: `${ADMIN_BASE}/database`,     icon: Database,        count: null },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "ai",   label: "AI Config", href: `${ADMIN_BASE}/settings`, icon: Wand2 },
  { id: "site", label: "Site",      href: `${ADMIN_BASE}/settings`, icon: Settings },
];


/**
 * Grouped admin nav: [Overview, Toko, Konten Situs, Admin Panel].
 *
 * Seller-first split (2026-06-10): commerce operations (orders / inventory
 * / customers / finance — the daily selling loop) live in their own "Toko"
 * group, fully separated from the headless-CMS surfaces ("Konten Situs":
 * pages / landing / notes / database). A seller processing orders never
 * wades through CMS items, and content edits never touch commerce CRUD.
 *
 * Derives from the legacy flat `buildAdminPrimaryNav` so the source
 * of truth for per-template items stays in one place.
 */
const COMMERCE_NAV_IDS = new Set([
  "orders",
  "inventory",
  "catalog",
  "stores",
  "customers",
  "promotions",
  "finance",
  "analytics",
  "suppliers",
  "businesses",
  "staff",
]);

export function buildAdminNav(state: State): AdminNavGroup[] {
  const flat = buildAdminPrimaryNav(state);
  const dashboard = flat.find((i) => i.id === "dashboard");
  const pagesParent = flat.find((i) => i.id === "pages");
  const commerce = flat.filter((i) => COMMERCE_NAV_IDS.has(i.id));
  // Order by the selling loop, not the legacy declaration order.
  const commerceRank = ["orders", "catalog", "stores", "inventory", "customers", "promotions", "finance", "analytics", "suppliers", "businesses", "staff"];
  commerce.sort((a, b) => commerceRank.indexOf(a.id) - commerceRank.indexOf(b.id));
  const content = flat.filter(
    (i) => i.id !== "dashboard" && i.id !== "pages" && !COMMERCE_NAV_IDS.has(i.id),
  );
  const groups: AdminNavGroup[] = [];
  if (dashboard) groups.push({ id: "overview", label: "Overview", homeAware: true, items: [dashboard] });
  if (commerce.length) groups.push({ id: "toko", label: "Toko", items: commerce });
  const contentItems = [...(pagesParent?.children ?? []), ...content];
  if (contentItems.length) {
    groups.push({ id: "konten", label: "Konten Situs", items: contentItems });
  }
  groups.push({ id: "admin-panel", label: "Admin Panel", items: buildAdminPanelNav(ADMIN_BASE) });
  return groups;
}
