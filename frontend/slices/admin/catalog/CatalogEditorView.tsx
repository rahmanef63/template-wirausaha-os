"use client";

import * as React from "react";
import { CrudFormView } from "@/features/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/features/_shared/crud/types";
import { useStore } from "@/features/_app/store";
import { ADMIN_BASE } from "@/features/_app/nav-config";
import type { CatalogItem } from "@/features/_app/types";
import { useCatalogController } from "./CatalogView";

const META: EntityMeta = { label: "Produk", labelPlural: "Katalog" };

export function useFields(): FieldDef<CatalogItem>[] {
  const { state } = useStore();
  const productOptions = React.useMemo(
    () => [
      { value: "", label: "— Tanpa link inventory —" },
      ...state.products.map((p) => ({ value: p.id, label: p.name })),
    ],
    [state.products],
  );

  return React.useMemo<FieldDef<CatalogItem>[]>(
    () => [
      { kind: "text", key: "name", label: "Nama produk", placeholder: "Kopi Susu Gula Aren" },
      { kind: "text", key: "slug", label: "Slug", mono: true, hint: "Otomatis dari nama saat disimpan." },
      {
        kind: "select",
        key: "category",
        label: "Kategori",
        options: [
          { value: "Kuliner", label: "Kuliner" },
          { value: "Retail", label: "Retail" },
          { value: "Jasa", label: "Jasa" },
          { value: "Paket", label: "Paket" },
          { value: "Promo", label: "Promo" },
        ],
      },
      { kind: "text", key: "priceLabel", label: "Label harga", placeholder: "Rp 25.000" },
      { kind: "number", key: "price", label: "Harga (IDR)", min: 0, hint: "Nominal untuk cart/checkout (opsional)." },
      { kind: "textarea", key: "blurb", label: "Deskripsi", rows: 3, placeholder: "Deskripsi singkat produk" },
      { kind: "text", key: "badge", label: "Badge (opsional)", placeholder: "Best seller / Baru / Promo" },
      { kind: "text", key: "emoji", label: "Emoji", placeholder: "🍽️" },
      { kind: "text", key: "gradient", label: "Gradient", mono: true, placeholder: "from-amber-400 to-rose-500" },
      { kind: "imagePicker", key: "image", label: "Foto produk", wide: true },
      { kind: "select", key: "productId", label: "Link inventory (opsional)", options: productOptions, wide: true },
    ],
    [productOptions],
  );
}

export function CatalogEditorView({ id }: { id: string }) {
  const controller = useCatalogController();
  const fields = useFields();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={fields}
      backHref={`${ADMIN_BASE}/catalog`}
    />
  );
}
