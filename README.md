<div align="center">

# Wirausaha OS

**A 100% headless UKM operations hub you fully own.**
Clone it to your own Vercel + Convex, sign in, and run a whole small business — catalog,
orders, customers, finance, staff, stores, promotions, plus a public storefront — from one
ops dashboard. No code required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rahmanef63/template-wirausaha-os)

![Next.js 16](https://img.shields.io/badge/Next.js-16-black)
![React 19](https://img.shields.io/badge/React-19-149eca)
![Convex](https://img.shields.io/badge/Convex-realtime-orange)
![Tailwind 4](https://img.shields.io/badge/Tailwind-4-38bdf8)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

[**Live demo**](https://wirausaha-os.vercel.app)

</div>

---

## What is this?

A **clone-to-own** website + back office for UMKM, brand lokal, and wirausahawan. Deploy it to
**your** infrastructure and you get a public storefront whose every product, order, and page lives
in **your** Convex database — managed entirely from the ops dashboard. The frontend is stateless,
so updates never touch your data.

- 🛒 **For buyers** — a fast, SEO-ready storefront: catalog, store locator, journal, reviews, guest checkout.
- 🧑‍💼 **For you** — one dashboard to run catalog, inventory, orders, customers, finance, staff, suppliers, and promos. Zero coding.
- 🔒 **Yours** — your repo, your Vercel, your Convex. No vendor lock-in.

## ✨ Features

- **Headless ops on Convex** — businesses, products, inventory, orders, customers, finance,
  staff, suppliers, stores, catalog, promotions, journal, reviews, leads, subscribers, pages,
  landing sections. Realtime, all edited from `/dashboard/admin`.
- **Public storefront** — home, catalog + product pages, store locator, journal, services,
  testimonials, contact, and a **guest checkout** with order tracking at `/order/[id]`
  (DOKU / Midtrans payment scaffolding included).
- **Zero-touch setup** — deploy → open `/admin` → claim owner → run the **onboarding wizard** →
  one-click sample content. No env editing, no terminal. Auth keys auto-provision at build.
- **Branding from the dashboard** — site name, tagline, logo, **favicon**, brand colour,
  light/dark/system theme, and a **theme preset**. Stored in Convex, applied across the site at runtime.
- **One-button image picker** — gallery · upload · paste-URL · curated **Unsplash** (set
  `UNSPLASH_ACCESS_KEY` to widen the search), plus an icon picker for products and blocks.
- **Page & landing builder** — drag-and-drop block renderer (hero, feature grid, pricing, FAQ,
  stats, CTA, …) with a catch-all public route, edited from the dashboard.
- **Secure admin** — keyless first-owner claim, then signup gates behind an invite key
  (`ADMIN_SIGNUP_KEY`) or auto-admin from env (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- **Real team & roles** — `owner / admin / editor / viewer` mapped over `@convex-dev/auth`, surfaced
  in the admin panel with an **audit log**, webhooks, API keys, and AI-config blocks.
- **`/setup` health page** — a plain-language checklist of what's done and what's left, each step
  linking to its fix. No log-reading.
- **In-app updates** — admin sees current vs latest version (`version.json`) and rebuilds in one
  click via a Vercel deploy hook (`VERCEL_DEPLOY_HOOK_URL`).
- **Backup & restore** — export / re-import all your content as JSON, no terminal.
- **AI assistant** — a built-in chat FAB (Anthropic via the AI SDK) with model + moderation config in the admin panel.
- **Production Next.js** — SSR metadata, true HTTP 404s, error/loading boundaries, branded
  not-found, a splash loader until data is ready.
- **Demo / clone stages** — a "Deploy your own" button shows on the demo only (`NEXT_PUBLIC_DEMO`).
- **Tested clones** — `npm run smoke` checks a clone can deploy (local, no CI cost).

## 🚀 Quick start (non-coder)

1. Click **[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https://github.com/rahmanef63/template-wirausaha-os)** → connect GitHub → add the **Convex** integration → Deploy.
2. Open `https://your-site.vercel.app/admin` → claim the first account (= owner).
3. Run the onboarding wizard, then click **"Isi konten contoh"** to fill the storefront. Done.

## 💻 Local development

```bash
npm install --legacy-peer-deps
cp .env.example .env.local        # set NEXT_PUBLIC_CONVEX_URL
npx convex dev --once             # generates convex/_generated
npm run dev                       # http://localhost:3000
```

## 🔐 Environment — two places

Variables live in **two** dashboards. The Deploy/clone button only fills the Vercel ones;
set the Convex ones in the Convex dashboard (or let the build do it).

| Variable | Where | Required | Purpose |
|----------|-------|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Vercel | ✅ | Convex deployment URL (`.convex.cloud`) |
| `CONVEX_DEPLOY_KEY` | Vercel | ✅ | deploys functions + schema at build — needs `deploy` + `env:view` + `env:write` (or full access) |
| `JWT_PRIVATE_KEY` / `JWKS` / `SITE_URL` | Convex | ✅ | login signing — **auto-set at build** by `scripts/setup-auth.mjs` (or `npx @convex-dev/auth`) |
| `ADMIN_SIGNUP_KEY` | Convex | – | invite key for extra admins |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Convex | – | auto-create the owner on first load |
| `VERCEL_DEPLOY_HOOK_URL` | Convex | – | enables the admin "Rebuild now" / in-app update button |
| `UNSPLASH_ACCESS_KEY` | Convex/Vercel | – | widens the image-picker Unsplash tab (falls back to a curated set) |
| `NEXT_PUBLIC_DEMO` | Vercel | – | demo only — shows the "Deploy your own" button |

> `vercel.json` sets the Build Command to `npm run build:auto`, which runs `convex deploy` (and
> auth-key provisioning) automatically when `CONVEX_DEPLOY_KEY` is present — no manual Build Command
> change needed in the Vercel UI.

## 🧱 Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 · Tailwind CSS 4 · shadcn/ui · Radix · dnd-kit · Recharts |
| Backend / DB | Convex — realtime |
| Auth | `@convex-dev/auth` (Password + optional GitHub/Google OAuth) |
| Theme | next-themes (light / dark / system) + theme presets |
| Images | `image-picker` slice (gallery · upload · link · Unsplash) + `icon-picker` |
| AI | AI SDK (`@ai-sdk/anthropic`) |

## 🗂️ Project structure

```
app/
  (public)/        storefront — home, catalog, journal, services, stores, testimoni, contact,
                   checkout, order/[id] (+ loading/error/404)
  dashboard/admin/ ops dashboard (gated): businesses, catalog, inventory, orders, customers,
                   finance, staff, stores, suppliers, promotions, journal, reviews, leads,
                   pages, landing, analytics + admin-panel/ (users · audit-log · webhooks · ai-config)
  admin/           redirect → /dashboard/admin
  setup/           /setup health page
  api/unsplash/    image-picker Unsplash proxy
  icon.tsx         default favicon
components/
  onboarding/      onboarding wizard          setup/  setup health checklist
  admin/           backup-card · update-card  blocks/ landing/page block renderer
  public-chrome.tsx · admin-gate.tsx · site-loader.tsx · demo-ribbon.tsx · ai-chat-fab.tsx
convex/
  schema.ts        auth + UKM content + siteSettings + admin-panel tables
  setup.ts settings.ts seed.ts backup.ts update.ts auth.ts files.ts checkout.ts  …modules
  adminPanel_*.ts  users/roles · analytics · audit-log · webhooks · aiConfig · settings
  features/        aiChat · comments · notion · payment (DOKU/Midtrans)
lib/headless-core/   version manifest + settings core
frontend/slices/     image-picker · icon-picker
scripts/             setup-auth.mjs (build-time JWT keys) · smoke-test.mjs
```

## 🗺️ Roadmap

- [x] **headless-core** module + version manifest (`lib/headless-core/`)
- [x] One-click **"Update available"** in admin (Vercel deploy hook)
- [x] One-click **backup / restore**
- [x] Roles (owner / admin / editor / viewer) + audit log, surfaced in the admin panel
- [x] **`/setup`** health page + clone **smoke-test**
- [x] Guest **checkout** + order tracking (DOKU / Midtrans scaffolding)
- [ ] Per-action RBAC enforcement across all dashboard sections
- [ ] Live payment-gateway wiring (production keys + webhooks)
- [ ] Optional Resend "forgot password" / order-status email flow

## 📄 License

MIT © Rahman ([rahmanef.com](https://rahmanef.com))

<div align="center"><sub>Built with <a href="https://resource.rahmanef.com">rahman-resources</a>.</sub></div>
