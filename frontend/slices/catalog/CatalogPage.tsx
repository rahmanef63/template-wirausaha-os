"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, ShoppingBag, ShoppingCart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/features/_shared/ui/section-head";
import { Reveal, Stagger } from "@/features/_shared/motion";
import { useCart } from "@/features/storefront-checkout";
import { useCatalog } from "@/features/_app/store";
import { PUBLIC_BASE } from "@/features/_app/nav-config";
import type { CatalogItem } from "@/features/_app/types";

/** "Rp 22.000" / "Rp 7.000 / kg" → 22000 / 7000 (display-side fallback). */
function parseIDR(label: string): number | null {
  const digits = label.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Public product catalog. Filterable by category chip. Each card uses an
 * emoji + gradient placeholder (no <img> per template constraints) and
 * links to a detail route. Cards derive from `state.catalog`, which is
 * seeded statically — admin CRUD can later wire to the same slice via
 * createTemplateStore actions.
 */
export function CatalogPage() {
  const items = useCatalog();
  const [active, setActive] = React.useState<string>("Semua");

  const categories = React.useMemo(() => {
    const set = new Set<string>(["Semua"]);
    items.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [items]);

  const filtered = React.useMemo(() => {
    if (active === "Semua") return items;
    return items.filter((i) => i.category === active);
  }, [items, active]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Katalog"
        title="Semua produk & layanan dalam satu tempat"
        subtitle="Pilih dari menu kuliner, kebutuhan retail, layanan jasa, sampai paket hemat. Klik kartu untuk detail."
      />

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Sparkles className="size-3.5 text-muted-foreground" />
        {categories.map((c) => (
          <Button
            key={c}
            variant={active === c ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setActive(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-10 border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          Tidak ada item di kategori ini. Pilih kategori lain.
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stagger itemClassName="h-full">
            {filtered.map((item) => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </Stagger>
        </div>
      )}

      <Reveal
        variant="zoom"
        className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/50 p-6"
      >
        <div className="flex items-start gap-3">
          <ShoppingBag className="mt-1 size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Mau order dalam jumlah besar?</p>
            <p className="text-xs text-muted-foreground">
              Hubungi tim kami untuk harga grosir, katering, atau langganan bulanan.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`${PUBLIC_BASE}/contact`}>
            Hubungi tim <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}

function CatalogCard({ item }: { item: CatalogItem }) {
  const { add } = useCart();
  const [added, setAdded] = React.useState(false);
  const unitPrice = item.price ?? parseIDR(item.priceLabel);

  function quickAdd(e: React.MouseEvent) {
    // The whole card is a Link — keep the click on the button.
    e.preventDefault();
    e.stopPropagation();
    if (!unitPrice) return;
    add({
      slug: item.slug,
      name: item.name,
      price: unitPrice,
      priceLabel: item.priceLabel,
      emoji: item.emoji,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <Link
      href={`${PUBLIC_BASE}/catalog/${item.slug}`}
      className="group block"
      aria-label={item.name}
    >
      <Card className="h-full overflow-hidden border-border/60 bg-card/50 transition-[translate,box-shadow,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:bg-card hover:shadow-lg">
        <div
          className={`relative flex aspect-[5/3] items-center justify-center overflow-hidden bg-gradient-to-br ${item.gradient}`}
        >
          <span className="text-6xl drop-shadow-md" aria-hidden>
            {item.emoji}
          </span>
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          {item.badge && (
            <Badge className="absolute left-3 top-3 z-10 bg-background/90 text-foreground">
              {item.badge}
            </Badge>
          )}
        </div>
        <CardContent className="space-y-2 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium leading-snug group-hover:underline">
              {item.name}
            </h3>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {item.priceLabel}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {item.category}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {item.blurb}
          </p>
          {unitPrice && (
            <Button
              variant={added ? "secondary" : "outline"}
              size="sm"
              className="mt-1 w-full"
              onClick={quickAdd}
            >
              {added ? (
                <>
                  <Check className="size-4" /> Masuk keranjang
                </>
              ) : (
                <>
                  <ShoppingCart className="size-4" /> Tambah ke keranjang
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
