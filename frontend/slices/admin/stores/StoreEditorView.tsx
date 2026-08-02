"use client";

import * as React from "react";
import { CrudFormView } from "@/features/_shared/crud/CrudFormView";
import type { EntityMeta, FieldDef } from "@/features/_shared/crud/types";
import { useStore } from "@/features/_app/store";
import { ADMIN_BASE } from "@/features/_app/nav-config";
import type { StoreLocation } from "@/features/_app/types";
import { useStoresController } from "./StoresView";

const META: EntityMeta = { label: "Outlet", labelPlural: "Outlet" };

export function useFields(): FieldDef<StoreLocation>[] {
  const { state } = useStore();
  const businessOptions = React.useMemo(
    () => [
      { value: "", label: "— Tanpa bisnis —" },
      ...state.businesses.map((b) => ({ value: b.id, label: b.name })),
    ],
    [state.businesses],
  );

  return React.useMemo<FieldDef<StoreLocation>[]>(
    () => [
      { kind: "text", key: "name", label: "Nama outlet", placeholder: "Outlet Pusat" },
      { kind: "text", key: "city", label: "Kota", placeholder: "Bandung" },
      { kind: "textarea", key: "address", label: "Alamat", rows: 2, placeholder: "Jl. Merdeka No. 1" },
      { kind: "text", key: "phone", label: "Telepon", mono: true, placeholder: "0812-3456-7890" },
      { kind: "text", key: "hours", label: "Jam buka", placeholder: "Sen–Sab 08:00–21:00" },
      { kind: "text", key: "mapsUrl", label: "Google Maps URL (opsional)", mono: true, placeholder: "https://maps.app.goo.gl/…", wide: true },
      { kind: "icon", key: "emoji", label: "Emoji" },
      { kind: "text", key: "gradient", label: "Gradient (Tailwind)", mono: true, placeholder: "from-amber-500 to-orange-600" },
      { kind: "select", key: "businessId", label: "Bisnis (opsional)", options: businessOptions, wide: true },
    ],
    [businessOptions],
  );
}

export function StoreEditorView({ id }: { id: string }) {
  const controller = useStoresController();
  const fields = useFields();
  return (
    <CrudFormView
      id={id}
      meta={META}
      controller={controller}
      fields={fields}
      backHref={`${ADMIN_BASE}/stores`}
    />
  );
}
