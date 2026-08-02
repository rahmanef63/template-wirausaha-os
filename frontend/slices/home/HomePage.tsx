"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  useBusinesses,
  useJournal,
  useLandingSections,
  useProducts,
  useReviews,
} from "@/features/_app/store";
import { renderLanding } from "./LandingRenderer";

/**
 * Composes the public home from admin-editable `landingSections`.
 * Order + visibility + per-section copy are owned by /admin/landing;
 * BroadcastChannel sync makes edits appear here without a reload.
 *
 * Pre-AJ-wave this file hard-coded section order + uneditable copy.
 */
export function HomePage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const sections = useLandingSections();
  const businesses = useBusinesses();
  const products = useProducts();
  const reviews = useReviews();
  const journal = useJournal();

  const subscribe = useMutation(api.subscribers.subscribe);
  const onSubscribe = React.useCallback(
    async (email: string) => {
      await subscribe({ email, source: "landing" });
      return { ok: true as const };
    },
    [subscribe],
  );

  const ordered = React.useMemo(
    () => [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order),
    [sections],
  );

  if (!mounted) return null;

  // Fresh/unseeded site: no landing sections yet -> guide instead of a blank page.
  if (ordered.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-6 text-center">
        <div>
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Situs sedang disiapkan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Belum ada konten. Kalau kamu pemiliknya, masuk ke dashboard dan klik
            "Isi konten contoh" untuk mulai.
          </p>
          <Button asChild className="mt-6">
            <Link href="/admin">Masuk admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{ordered.map((s) => renderLanding(s, { businesses, products, reviews, journal, onSubscribe }))}</>;
}
