"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { IS_DEMO } from "@/lib/stage";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { pagesReducer } from "@/features/_shared/pages/reducer";
import type { LandingSection } from "@/features/_shared/landing/types";
import { reducer } from "./store-reducer";
import { saveDemoState, broadcastAction, openDemoChannel } from "@/lib/demo-store";
import type { Action, State } from "./types";

// DEMO dispatch: every action runs through the same pure `reducer`, the next
// State is persisted to localStorage, and the action is broadcast so the
// sibling iframe (public<->admin) re-renders live. Mounted only when
// NEXT_PUBLIC_DEMO=1 (see store.tsx DemoProvider); replaces the Convex mutation
// path for the demo. Real clones never call this — they use useConvexDispatch.
export function useDemoDispatch(
  setState: React.Dispatch<React.SetStateAction<State>>,
): (a: Action) => void {
  // One channel per provider instance; closed on unmount.
  const channelRef = React.useRef<BroadcastChannel | null>(null);
  React.useEffect(() => {
    channelRef.current = openDemoChannel();
    return () => channelRef.current?.close();
  }, []);

  return React.useCallback(
    (action: Action) => {
      setState((s) => {
        const next = reducer(s, action);
        saveDemoState(next);
        return next;
      });
      broadcastAction(channelRef.current, action);
    },
    [setState],
  );
}

// Dispatch wiring, split out of store.tsx (move-only): routes each store
// action to the matching Convex mutation. `id` is passed to upsert only when
// it's a known Convex id (existing row); a fresh nid -> insert.

export function useConvexDispatch(state: State): (a: Action) => void {
  const mBusinessUpsert = useMutation(api.businesses.upsert);
  const mBusinessRemove = useMutation(api.businesses.remove);
  const mProductUpsert = useMutation(api.products.upsert);
  const mProductRemove = useMutation(api.products.remove);
  const mOrderUpsert = useMutation(api.orders.upsert);
  const mOrderRemove = useMutation(api.orders.remove);
  const mCustomerUpsert = useMutation(api.customers.upsert);
  const mCustomerRemove = useMutation(api.customers.remove);
  const mFinanceUpsert = useMutation(api.finance.upsert);
  const mFinanceRemove = useMutation(api.finance.remove);
  const mStaffUpsert = useMutation(api.staff.upsert);
  const mStaffRemove = useMutation(api.staff.remove);
  const mReviewUpsert = useMutation(api.reviews.upsert);
  const mReviewRemove = useMutation(api.reviews.remove);
  const mPromotionUpsert = useMutation(api.promotions.upsert);
  const mPromotionRemove = useMutation(api.promotions.remove);
  const mSupplierUpsert = useMutation(api.suppliers.upsert);
  const mSupplierRemove = useMutation(api.suppliers.remove);
  const mCatalogUpsert = useMutation(api.catalog.upsert);
  const mCatalogRemove = useMutation(api.catalog.remove);
  const mStoreUpsert = useMutation(api.stores.upsert);
  const mStoreRemove = useMutation(api.stores.remove);
  const mJournalUpsert = useMutation(api.journal.upsert);
  const mJournalRemove = useMutation(api.journal.remove);
  const mPageUpsert = useMutation(api.pages.upsert);
  const mPageRemove = useMutation(api.pages.remove);
  const mLandingUpsert = useMutation(api.landing.upsert);
  const mLandingRemove = useMutation(api.landing.remove);

  const knownIds = React.useMemo(
    () => ({
      businesses: new Set(state.businesses.map((b) => b.id)),
      products: new Set(state.products.map((p) => p.id)),
      orders: new Set(state.orders.map((o) => o.id)),
      customers: new Set(state.customers.map((c) => c.id)),
      finance: new Set(state.finance.map((f) => f.id)),
      staff: new Set(state.staff.map((s) => s.id)),
      reviews: new Set(state.reviews.map((r) => r.id)),
      promotions: new Set(state.promotions.map((p) => p.id)),
      suppliers: new Set(state.suppliers.map((s) => s.id)),
      catalog: new Set(state.catalog.map((c) => c.id)),
      stores: new Set(state.stores.map((s) => s.id)),
      journal: new Set(state.journal.map((j) => j.id)),
    }),
    [state],
  );

  return React.useCallback(
    (action: Action) => {
      // PUBLIC-demo isolation: block ALL business writes so 5 visitors sharing
      // the demo Convex DB never stomp each other. Reads (useQuery) keep showing
      // seeded content. Pure no-op when NEXT_PUBLIC_DEMO !== "1".
      if (IS_DEMO) {
        toast.info("Mode demo — clone template untuk menyimpan perubahan");
        return;
      }
      const fail = (e: unknown) => console.error(`[store] ${action.type} failed`, e);
      switch (action.type) {
        case "business.upsert": {
          const { id, ...d } = action.business;
          void (knownIds.businesses.has(id)
            ? mBusinessUpsert({ id: id as Id<"wirausahaBusinesses">, ...d })
            : mBusinessUpsert(d)
          ).catch(fail);
          break;
        }
        case "business.delete":
          void mBusinessRemove({ id: action.id as Id<"wirausahaBusinesses"> }).catch(fail);
          break;

        case "product.upsert": {
          const { id, ...d } = action.product;
          void (knownIds.products.has(id)
            ? mProductUpsert({ id: id as Id<"wirausahaProducts">, ...d })
            : mProductUpsert(d)
          ).catch(fail);
          break;
        }
        case "product.delete":
          void mProductRemove({ id: action.id as Id<"wirausahaProducts"> }).catch(fail);
          break;

        case "order.upsert": {
          const { id, ...d } = action.order;
          void (knownIds.orders.has(id)
            ? mOrderUpsert({ id: id as Id<"wirausahaOrders">, ...d })
            : mOrderUpsert(d)
          ).catch(fail);
          break;
        }
        case "order.delete":
          void mOrderRemove({ id: action.id as Id<"wirausahaOrders"> }).catch(fail);
          break;

        case "customer.upsert": {
          const { id, ...d } = action.customer;
          void (knownIds.customers.has(id)
            ? mCustomerUpsert({ id: id as Id<"wirausahaCustomers">, ...d })
            : mCustomerUpsert(d)
          ).catch(fail);
          break;
        }
        case "customer.delete":
          void mCustomerRemove({ id: action.id as Id<"wirausahaCustomers"> }).catch(fail);
          break;

        case "finance.upsert": {
          const { id, ...d } = action.record;
          void (knownIds.finance.has(id)
            ? mFinanceUpsert({ id: id as Id<"wirausahaFinance">, ...d })
            : mFinanceUpsert(d)
          ).catch(fail);
          break;
        }
        case "finance.delete":
          void mFinanceRemove({ id: action.id as Id<"wirausahaFinance"> }).catch(fail);
          break;

        case "staff.upsert": {
          const { id, ...d } = action.member;
          void (knownIds.staff.has(id)
            ? mStaffUpsert({ id: id as Id<"wirausahaStaff">, ...d })
            : mStaffUpsert(d)
          ).catch(fail);
          break;
        }
        case "staff.delete":
          void mStaffRemove({ id: action.id as Id<"wirausahaStaff"> }).catch(fail);
          break;

        case "review.upsert": {
          const { id, ...d } = action.review;
          void (knownIds.reviews.has(id)
            ? mReviewUpsert({ id: id as Id<"wirausahaReviews">, ...d })
            : mReviewUpsert(d)
          ).catch(fail);
          break;
        }
        case "review.delete":
          void mReviewRemove({ id: action.id as Id<"wirausahaReviews"> }).catch(fail);
          break;

        case "promotion.upsert": {
          const { id, ...d } = action.promotion;
          void (knownIds.promotions.has(id)
            ? mPromotionUpsert({ id: id as Id<"wirausahaPromotions">, ...d })
            : mPromotionUpsert(d)
          ).catch(fail);
          break;
        }
        case "promotion.delete":
          void mPromotionRemove({ id: action.id as Id<"wirausahaPromotions"> }).catch(fail);
          break;

        case "supplier.upsert": {
          const { id, ...d } = action.supplier;
          void (knownIds.suppliers.has(id)
            ? mSupplierUpsert({ id: id as Id<"wirausahaSuppliers">, ...d })
            : mSupplierUpsert(d)
          ).catch(fail);
          break;
        }
        case "supplier.delete":
          void mSupplierRemove({ id: action.id as Id<"wirausahaSuppliers"> }).catch(fail);
          break;

        case "catalog.upsert": {
          const { id, ...d } = action.item;
          void (knownIds.catalog.has(id)
            ? mCatalogUpsert({ id: id as Id<"wirausahaCatalog">, ...d })
            : mCatalogUpsert(d)
          ).catch(fail);
          break;
        }
        case "catalog.delete":
          void mCatalogRemove({ id: action.id as Id<"wirausahaCatalog"> }).catch(fail);
          break;

        case "store.upsert": {
          const { id, ...d } = action.store;
          void (knownIds.stores.has(id)
            ? mStoreUpsert({ id: id as Id<"wirausahaStores">, ...d })
            : mStoreUpsert(d)
          ).catch(fail);
          break;
        }
        case "store.delete":
          void mStoreRemove({ id: action.id as Id<"wirausahaStores"> }).catch(fail);
          break;

        case "journal.upsert": {
          const { id, ...d } = action.entry;
          void (knownIds.journal.has(id)
            ? mJournalUpsert({ id: id as Id<"wirausahaJournal">, ...d })
            : mJournalUpsert(d)
          ).catch(fail);
          break;
        }
        case "journal.delete":
          void mJournalRemove({ id: action.id as Id<"wirausahaJournal"> }).catch(fail);
          break;

        case "PAGE_DELETE":
          void mPageRemove({ entryId: action.payload.id }).catch(fail);
          break;
        case "PAGE_CREATE":
        case "PAGE_UPDATE":
        case "PAGE_REORDER_BLOCK":
        case "PAGE_SECTION_UPSERT":
        case "PAGE_SECTION_DELETE": {
          const next = pagesReducer({ pages: state.pages }, action);
          const pid =
            (action.payload as { id?: string; pageId?: string }).id ??
            (action.payload as { pageId?: string }).pageId;
          const entry = next.pages.find((p) => p.id === pid);
          if (entry) void mPageUpsert({ entryId: entry.id, slug: entry.slug, data: entry }).catch(fail);
          break;
        }

        case "LANDING_UPSERT": {
          const s = action.payload as LandingSection;
          void mLandingUpsert({ sectionId: s.id, data: s }).catch(fail);
          break;
        }
        case "LANDING_DELETE":
          void mLandingRemove({ sectionId: (action.payload as { id: string }).id }).catch(fail);
          break;

        case "hydrate":
        case "reset":
          // Convex is the source of truth — no-op.
          break;
      }
    },
    [knownIds, state.pages], // eslint-disable-line react-hooks/exhaustive-deps
  );
}
