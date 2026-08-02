"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  PagesProvider,
  type PagesStore,
} from "@/features/_shared/pages/pages-context";
import type { PageEntry } from "@/features/_shared/pages/types";
import {
  LandingProvider,
  type LandingStore,
} from "@/features/_shared/landing/landing-context";
import type { LandingSection } from "@/features/_shared/landing/types";
import { ADMIN_BASE, PUBLIC_BASE } from "./nav-config";
import { StoreCtx, useStore, type Ctx } from "./store-context";
import { useConvexDispatch, useDemoDispatch } from "./store-dispatch";
import { reducer } from "./store-reducer";
import { SEED_STATE } from "./seed";
import { loadDemoState, openDemoChannel } from "@/lib/demo-store";
import { IS_DEMO } from "@/lib/stage";
import type { Action, State } from "./types";

// Convex-backed store. Replaces the old localStorage reducer: `state` is
// assembled from live Convex queries; `dispatch` routes each action to the
// matching Convex mutation (see store-dispatch.tsx). Consuming slices are
// UNCHANGED — they still call useStore()/useX()/dispatch(action).
//
// id mapping: frontend objects key by `id` (string); Convex keys by `_id`.
// On read we map `_id` -> `id`. On upsert we pass `id` only when it's a known
// Convex id (existing row); a fresh nid -> insert.

const withId = <T,>(rows: ReadonlyArray<Record<string, unknown>> | undefined): T[] =>
  ((rows ?? []) as Array<Record<string, unknown>>).map(({ _id, _creationTime: _ct, ...r }) => ({ ...r, id: _id })) as T[];

function Provider({ children }: { children: React.ReactNode }) {
  if (IS_DEMO) return <DemoProvider>{children}</DemoProvider>;
  return <ConvexProvider>{children}</ConvexProvider>;
}

// DEMO-only provider: no Convex queries run (the demo store lives entirely in
// localStorage), state syncs across the public<->admin iframes via a
// BroadcastChannel. Mounted only when NEXT_PUBLIC_DEMO=1; tree-shaken/never
// reached in real clones (IS_DEMO is a build-time const false).
function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(() => loadDemoState(SEED_STATE));

  // Apply actions broadcast from the *other* iframe through the same reducer,
  // so a create/edit/delete in the admin frame re-renders the public frame.
  React.useEffect(() => {
    const ch = openDemoChannel();
    if (!ch) return;
    ch.onmessage = (e: MessageEvent<Action>) => setState((s) => reducer(s, e.data));
    return () => ch.close();
  }, []);

  const dispatch = useDemoDispatch(setState);

  const value = React.useMemo<Ctx>(
    // ponytail: ready=true immediately + progress=100 — the demo state is in
    // hand synchronously, no network load phase to report.
    () => ({ state, dispatch, ready: true, progress: 100 }),
    [state, dispatch],
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

function ConvexProvider({ children }: { children: React.ReactNode }) {
  const businesses = useQuery(api.businesses.listAll, {});
  const products = useQuery(api.products.listAll, {});
  const orders = useQuery(api.orders.listAll, {});
  const customers = useQuery(api.customers.listAll, {});
  const finance = useQuery(api.finance.listAll, {});
  const staff = useQuery(api.staff.listAll, {});
  const catalog = useQuery(api.catalog.listAll, {});
  const stores = useQuery(api.stores.listAll, {});
  const journal = useQuery(api.journal.listAll, {});
  const reviews = useQuery(api.reviews.listAll, {});
  const promotions = useQuery(api.promotions.listAll, {});
  const suppliers = useQuery(api.suppliers.listAll, {});
  const pageRows = useQuery(api.pages.list, {});
  const landingRows = useQuery(api.landing.list, {});

  const queries = [
    businesses, products, orders, customers, finance, staff, catalog,
    stores, journal, reviews, promotions, suppliers, pageRows, landingRows,
  ];
  const ready = queries.every((q) => q !== undefined);
  const progress = Math.round((queries.filter((q) => q !== undefined).length / queries.length) * 100);

  const state = React.useMemo<State>(
    () => ({
      businesses: withId(businesses),
      products: withId(products),
      orders: withId(orders),
      customers: withId(customers),
      finance: withId(finance),
      staff: withId(staff),
      catalog: withId(catalog),
      stores: withId(stores),
      journal: withId(journal),
      reviews: withId(reviews),
      promotions: withId(promotions),
      suppliers: withId(suppliers),
      pages: (pageRows ?? []) as PageEntry[],
      landingSections: (landingRows ?? []) as LandingSection[],
    }),
    [businesses, products, orders, customers, finance, staff, catalog, stores, journal, reviews, promotions, suppliers, pageRows, landingRows],
  );

  const dispatch = useConvexDispatch(state);

  const value = React.useMemo<Ctx>(
    () => ({ state, dispatch, ready, progress }),
    [state, dispatch, ready, progress],
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

function PagesAdapter({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useStore();
  const value = React.useMemo<PagesStore>(
    () => ({
      pages: state.pages,
      create: (entry: PageEntry) => dispatch({ type: "PAGE_CREATE", payload: entry }),
      update: (id, patch) => dispatch({ type: "PAGE_UPDATE", payload: { id, patch } }),
      remove: (id: string) => dispatch({ type: "PAGE_DELETE", payload: { id } }),
      reorderBlock: (id, from, to) =>
        dispatch({ type: "PAGE_REORDER_BLOCK", payload: { id, from, to } }),
      upsertSection: (pageId, section) =>
        dispatch({ type: "PAGE_SECTION_UPSERT", payload: { pageId, section } }),
      removeSection: (pageId, sectionId) =>
        dispatch({ type: "PAGE_SECTION_DELETE", payload: { pageId, sectionId } }),
    }),
    [state.pages, dispatch],
  );
  return <PagesProvider value={value}>{children}</PagesProvider>;
}

function LandingAdapter({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useStore();
  const value = React.useMemo<LandingStore>(
    () => ({
      items: state.landingSections,
      publicBase: PUBLIC_BASE,
      adminBase: ADMIN_BASE,
      create: (section: LandingSection) =>
        dispatch({ type: "LANDING_UPSERT", payload: section }),
      update: (id, patch) => {
        const current = state.landingSections.find((s) => s.id === id);
        if (!current) return;
        dispatch({ type: "LANDING_UPSERT", payload: { ...current, ...patch, id } });
      },
      remove: (id: string) => dispatch({ type: "LANDING_DELETE", payload: { id } }),
    }),
    [state.landingSections, dispatch],
  );
  return <LandingProvider value={value}>{children}</LandingProvider>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <PagesAdapter>
        <LandingAdapter>{children}</LandingAdapter>
      </PagesAdapter>
    </Provider>
  );
}

export { useStore };
export const usePages = () => useStore().state.pages;
export const useLandingSections = () => useStore().state.landingSections;

export const useBusinesses = () => useStore().state.businesses;
export const useProducts = () => useStore().state.products;
export const useOrders = () => useStore().state.orders;
export const useCustomers = () => useStore().state.customers;
export const useFinance = () => useStore().state.finance;
export const useStaff = () => useStore().state.staff;
export const useCatalog = () => useStore().state.catalog;
export const useStores = () => useStore().state.stores;
export const useJournal = () => useStore().state.journal;
export const useReviews = () => useStore().state.reviews;
export const usePromotions = () => useStore().state.promotions;
export const useSuppliers = () => useStore().state.suppliers;

export { nid, slugify, fmtDate, rel } from "@/features/_shared/utils";
