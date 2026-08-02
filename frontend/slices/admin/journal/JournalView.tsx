"use client";

import * as React from "react";
import { CrudListView } from "@/features/_shared/crud/CrudListView";
import type { ColumnDef, CrudController, EntityMeta } from "@/features/_shared/crud/types";
import { useStore, nid, slugify } from "@/features/_app/store";
import { ADMIN_BASE } from "@/features/_app/nav-config";
import { fmtDate } from "@/features/_shared/utils";
import type { JournalEntry } from "@/features/_app/types";
import { useFields } from "./JournalEditorView";

const META: EntityMeta = { label: "Jurnal", labelPlural: "Jurnal" };

const COLUMNS: ColumnDef<JournalEntry>[] = [
  { key: "emoji", header: "", width: "w-[6%]" },
  { key: "title", header: "Judul", width: "w-[34%]" },
  { key: "category", header: "Kategori", width: "w-[16%]", badge: "secondary", hideOnMobile: true },
  { key: "author", header: "Penulis", width: "w-[18%]", hideOnMobile: true },
  {
    key: "publishedAt",
    header: "Terbit",
    width: "w-[16%]",
    hideOnMobile: true,
    render: (v) => fmtDate(Number(v)),
  },
  { key: "slug", header: "Slug", width: "w-[18%]", mono: true, hideOnMobile: true },
];

export function useJournalController(): CrudController<JournalEntry> {
  const { state, dispatch } = useStore();
  return React.useMemo(
    () => ({
      items: state.journal,
      getId: (j) => j.id,
      blank: () => {
        const title = "Artikel baru";
        return {
          id: nid("journal"),
          slug: slugify(title),
          title,
          excerpt: "",
          body: "",
          category: "Promo",
          author: "",
          publishedAt: Date.now(),
          emoji: "📝",
          gradient: "from-amber-500 to-orange-500",
        };
      },
      create: (entry) => dispatch({ type: "journal.upsert", entry }),
      update: (id, patch) => {
        const cur = state.journal.find((j) => j.id === id);
        if (!cur) return;
        dispatch({ type: "journal.upsert", entry: { ...cur, ...patch, id } });
      },
      remove: (id) => dispatch({ type: "journal.delete", id }),
    }),
    [state.journal, dispatch],
  );
}

export function JournalView() {
  const controller = useJournalController();
  const fields = useFields();
  return (
    <CrudListView
      meta={META}
      controller={controller}
      columns={COLUMNS}
      fields={fields}
      editPath={(id) => `${ADMIN_BASE}/journal/${id}`}
      description={`${controller.items.length} artikel`}
    />
  );
}
