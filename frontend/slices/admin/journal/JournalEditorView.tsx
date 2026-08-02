"use client";

import * as React from "react";
import { CrudFormView } from "@/features/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/features/_shared/crud/types";
import { ADMIN_BASE } from "@/features/_app/nav-config";
import type { JournalEntry } from "@/features/_app/types";
import { useJournalController } from "./JournalView";

const META: EntityMeta = { label: "Jurnal", labelPlural: "Jurnal" };

export function useFields(): FieldDef<JournalEntry>[] {
  return React.useMemo<FieldDef<JournalEntry>[]>(
    () => [
      { kind: "text", key: "title", label: "Judul", placeholder: "Tips memulai usaha kuliner" },
      { kind: "text", key: "slug", label: "Slug", mono: true, hint: "Otomatis dari judul — ubah bila perlu", placeholder: "tips-memulai-usaha" },
      {
        kind: "select",
        key: "category",
        label: "Kategori",
        options: [
          { value: "Promo", label: "Promo" },
          { value: "Produk Baru", label: "Produk Baru" },
          { value: "Liputan", label: "Liputan" },
          { value: "Tips", label: "Tips" },
        ],
      },
      { kind: "text", key: "author", label: "Penulis", placeholder: "Tim Redaksi" },
      { kind: "date", key: "publishedAt", label: "Tanggal terbit" },
      { kind: "textarea", key: "excerpt", label: "Ringkasan", rows: 2, placeholder: "Cuplikan singkat untuk kartu artikel." },
      { kind: "textarea", key: "body", label: "Isi artikel", rows: 12, hint: "Pisahkan paragraf dengan satu baris kosong." },
      { kind: "text", key: "emoji", label: "Emoji", placeholder: "📝" },
      { kind: "text", key: "gradient", label: "Gradient (Tailwind)", mono: true, wide: true, placeholder: "from-amber-500 to-orange-500" },
    ],
    [],
  );
}

export function JournalEditorView({ id }: { id: string }) {
  const controller = useJournalController();
  const fields = useFields();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={fields}
      backHref={`${ADMIN_BASE}/journal`}
    />
  );
}
