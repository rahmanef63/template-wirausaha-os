"use client";

import * as React from "react";
import { CrudListView } from "@/features/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/features/_shared/crud/types";
import { useStore, nid, slugify } from "@/features/_app/store";
import { ADMIN_BASE } from "@/features/_app/nav-config";
import type { CatalogItem } from "@/features/_app/types";
import { useFields } from "./CatalogEditorView";

const META: EntityMeta = { label: "Produk", labelPlural: "Katalog" };

const COLUMNS: ColumnDef<CatalogItem>[] = [
  { key: "name", header: "Nama", width: "w-[28%]" },
  { key: "category", header: "Kategori", width: "w-[14%]", badge: "secondary" },
  { key: "priceLabel", header: "Harga", width: "w-[14%]", mono: true },
  { key: "badge", header: "Badge", width: "w-[14%]", hideOnMobile: true },
  { key: "slug", header: "Slug", width: "w-[18%]", mono: true, hideOnMobile: true },
];

export function useCatalogController(): CrudController<CatalogItem> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.catalog,
      getId: (c) => c.id,
      blank: () => ({
        id: nid("cat"),
        slug: slugify("Produk baru"),
        name: "Produk baru",
        category: "Kuliner",
        priceLabel: "Rp 25.000",
        price: 25000,
        blurb: "",
        badge: "",
        emoji: "🍽️",
        gradient: "from-amber-400 to-rose-500",
        image: "",
        productId: "",
      }),
      create: (item) => dispatch({ type: "catalog.upsert", item: { ...item, slug: slugify(item.name) } }),
      update: (id, patch) => {
        const cur = state.catalog.find((c) => c.id === id);
        if (!cur) return;
        const next = { ...cur, ...patch, id };
        dispatch({ type: "catalog.upsert", item: { ...next, slug: slugify(next.name) } });
      },
      remove: (id) => dispatch({ type: "catalog.delete", id }),
    }),
    [state.catalog, dispatch],
  );
}

export function CatalogView() {
  const controller = useCatalogController();
  const fields = useFields();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={fields}
      editPath={(id) => `${ADMIN_BASE}/catalog/${id}`}
      description={`${controller.items.length} produk di storefront`}
    />
  );
}
