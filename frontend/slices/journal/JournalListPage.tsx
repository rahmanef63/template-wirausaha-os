"use client";

import { ConceptListPage } from "@/features/_shared/concepts/ConceptListPage";
import { journalAdapter } from "@/features/_app/concepts";

/**
 * Public promo/news listing. Now renders via the shared ConceptListPage default
 * grid (visual unification across the fleet) — the bespoke featured-hero +
 * emoji/gradient cards were replaced by the uniform ConceptCardView grid.
 * Data is unchanged: the journalAdapter wraps the same `useJournal` selector.
 */
export function JournalListPage() {
  return <ConceptListPage adapter={journalAdapter} />;
}
