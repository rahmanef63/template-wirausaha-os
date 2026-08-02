"use client";

import * as React from "react";
import { CrudListView } from "@/features/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/features/_shared/crud/types";
import { useStore, nid } from "@/features/_app/store";
import { ADMIN_BASE } from "@/features/_app/nav-config";
import type { StoreLocation } from "@/features/_app/types";
import { useFields } from "./StoreEditorView";

const META: EntityMeta = { label: "Outlet", labelPlural: "Outlet" };

const COLUMNS: ColumnDef<StoreLocation>[] = [
  {
    key: "name",
    header: "Outlet",
    width: "w-[30%]",
    render: (v, r) => `${r.emoji ? `${r.emoji} ` : ""}${String(v)}`,
  },
  { key: "city", header: "Kota", width: "w-[18%]" },
  { key: "address", header: "Alamat", width: "w-[28%]", hideOnMobile: true },
  { key: "phone", header: "Telepon", width: "w-[14%]", mono: true, hideOnMobile: true },
  { key: "hours", header: "Jam", width: "w-[18%]", hideOnMobile: true },
];

export function useStoresController(): CrudController<StoreLocation> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.stores,
      getId: (s) => s.id,
      blank: () => ({
        id: nid("store"),
        name: "Outlet baru",
        city: "",
        address: "",
        phone: "",
        hours: "Sen–Sab 08:00–21:00",
        mapsUrl: "",
        emoji: "🏬",
        gradient: "from-amber-500 to-orange-600",
      }),
      create: (store) => dispatch({ type: "store.upsert", store }),
      update: (id, patch) => {
        const cur = state.stores.find((s) => s.id === id);
        if (!cur) return;
        dispatch({ type: "store.upsert", store: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "store.delete", id }),
    }),
    [state.stores, dispatch],
  );
}

export function StoresView() {
  const controller = useStoresController();
  const fields = useFields();
  const cities = new Set(controller.items.map((s) => s.city).filter(Boolean)).size;
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={fields}
      editPath={(id) => `${ADMIN_BASE}/stores/${id}`}
      description={`${cities} kota`}
    />
  );
}
