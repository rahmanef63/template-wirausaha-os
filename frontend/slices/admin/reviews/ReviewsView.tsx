"use client";

import * as React from "react";
import { CrudListView } from "@/features/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/features/_shared/crud/types";
import { useStore, nid } from "@/features/_app/store";
import { ADMIN_BASE } from "@/features/_app/nav-config";
import type { Review } from "@/features/_app/types";
import { useFields } from "./ReviewEditorView";

const META: EntityMeta = { label: "Testimoni", labelPlural: "Reviews" };

const COLUMNS: ColumnDef<Review>[] = [
  {
    key: "author",
    header: "Penulis",
    width: "w-[26%]",
    render: (v, r) => `${r.emoji ? `${r.emoji} ` : ""}${String(v)}`,
  },
  { key: "city", header: "Kota", width: "w-[16%]", hideOnMobile: true },
  { key: "category", header: "Kategori", width: "w-[14%]", badge: "secondary" },
  {
    key: "rating",
    header: "Rating",
    width: "w-[12%]",
    render: (v) => "★".repeat(Math.max(0, Math.min(5, Number(v)))) || "—",
  },
  { key: "body", header: "Isi", width: "w-[32%]", hideOnMobile: true },
];

export function useReviewsController(): CrudController<Review> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.reviews,
      getId: (r) => r.id,
      blank: () => ({
        id: nid("rev"),
        author: "Pelanggan baru",
        city: "",
        category: "Kuliner",
        rating: 5,
        body: "",
        emoji: "😊",
        publishedAt: Date.now(),
      }),
      create: (review) => dispatch({ type: "review.upsert", review }),
      update: (id, patch) => {
        const cur = state.reviews.find((r) => r.id === id);
        if (!cur) return;
        dispatch({ type: "review.upsert", review: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "review.delete", id }),
    }),
    [state.reviews, dispatch],
  );
}

export function ReviewsView() {
  const controller = useReviewsController();
  const fields = useFields();
  const avg = controller.items.length
    ? (
        controller.items.reduce((s, r) => s + Number(r.rating || 0), 0) /
        controller.items.length
      ).toFixed(1)
    : "0";
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={fields}
      editPath={(id) => `${ADMIN_BASE}/reviews/${id}`}
      description={`rata-rata ${avg} ★`}
    />
  );
}
