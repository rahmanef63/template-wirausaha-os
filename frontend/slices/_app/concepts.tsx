"use client";

import * as React from "react";
import { useJournal } from "@/features/_app/store";
import { PUBLIC_BASE } from "@/features/_app/nav-config";
import type {
  ConceptCard,
  ConceptListAdapter,
} from "@/features/_shared/concepts/ConceptListPage";

/**
 * Per-template CONCEPT REGISTRY — maps a canonical concept to {data selector +
 * field map + link}, consumed by the shared ConceptListPage (default grid via
 * ConceptCardView). Adapter-only: wraps existing selectors, no schema/table/
 * state rename → zero data migration. Every template ships its own copy of this
 * file pointing at its own tables (here `state.journal`), giving one consistent
 * list UI fleet-wide.
 */

export const journalAdapter: ConceptListAdapter = {
  header: {
    eyebrow: "Jurnal",
    title: "Promo, kabar baru, dan catatan dari dapur",
    subtitle:
      "Pembaruan rutin tentang menu baru, outlet baru, voucher, dan pembelajaran kami sebagai operator multi-unit.",
  },
  columns: 3,
  emptyText: "Belum ada tulisan di kategori ini.",
  hrefFor: (c) => `${PUBLIC_BASE}/journal/${c.slug}`,
  useCards: () => {
    const entries = useJournal();
    return React.useMemo<ConceptCard[]>(
      () =>
        [...entries]
          .sort((a, b) => b.publishedAt - a.publishedAt)
          .map((e) => ({
            id: e.id,
            slug: e.slug,
            title: e.title,
            excerpt: e.excerpt,
            date: e.publishedAt,
            tags: [e.category],
          })),
      [entries],
    );
  },
};
