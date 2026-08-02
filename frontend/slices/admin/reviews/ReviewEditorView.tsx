"use client";

import * as React from "react";
import { CrudFormView } from "@/features/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/features/_shared/crud/types";
import { useStore } from "@/features/_app/store";
import { ADMIN_BASE } from "@/features/_app/nav-config";
import type { Review } from "@/features/_app/types";
import { useReviewsController } from "./ReviewsView";

const META: EntityMeta = { label: "Testimoni", labelPlural: "Reviews" };

export function useFields(): FieldDef<Review>[] {
  const { state } = useStore();
  const storeOptions = React.useMemo(
    () => [
      { value: "", label: "— Semua outlet —" },
      ...state.stores.map((s) => ({ value: s.id, label: s.name })),
    ],
    [state.stores],
  );

  return React.useMemo<FieldDef<Review>[]>(
    () => [
      { kind: "text", key: "author", label: "Penulis", placeholder: "Budi Santoso" },
      { kind: "text", key: "city", label: "Kota", placeholder: "Bandung" },
      {
        kind: "select",
        key: "category",
        label: "Kategori",
        options: [
          { value: "Kuliner", label: "Kuliner" },
          { value: "Retail", label: "Retail" },
          { value: "Jasa", label: "Jasa" },
          { value: "Paket", label: "Paket" },
        ],
      },
      { kind: "number", key: "rating", label: "Rating", min: 1, max: 5, step: 1, hint: "1–5 bintang" },
      { kind: "text", key: "emoji", label: "Emoji", placeholder: "😊" },
      {
        kind: "select",
        key: "storeId",
        label: "Outlet (opsional)",
        options: storeOptions,
      },
      {
        kind: "textarea",
        key: "body",
        label: "Isi testimoni",
        rows: 4,
        placeholder: "Pelayanannya cepat dan ramah...",
      },
      { kind: "date", key: "publishedAt", label: "Tanggal publikasi" },
    ],
    [storeOptions],
  );
}

export function ReviewEditorView({ id }: { id: string }) {
  const controller = useReviewsController();
  const fields = useFields();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={fields}
      backHref={`${ADMIN_BASE}/reviews`}
    />
  );
}
