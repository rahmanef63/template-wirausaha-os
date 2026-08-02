"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Phone, ShoppingCart } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Reveal, Stagger } from "@/features/_shared/motion";
import { useCart } from "@/features/storefront-checkout";
import { useCatalog } from "@/features/_app/store";
import { PUBLIC_BASE } from "@/features/_app/nav-config";

/** "Rp 22.000" / "Rp 7.000 / kg" → 22000 / 7000 (display-side fallback). */
function parseIDR(label: string): number | null {
  const digits = label.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Detail page for a single catalog item, looked up by slug. */
export function CatalogDetailPage({ slug }: { slug: string }) {
  const items = useCatalog();
  const { add } = useCart();
  const [added, setAdded] = React.useState(false);
  const item = items.find((i) => i.slug === slug);
  if (!item) notFound();

  const unitPrice = item.price ?? parseIDR(item.priceLabel);

  function addToCart() {
    if (!unitPrice) return;
    add({
      slug: item!.slug,
      name: item!.name,
      price: unitPrice,
      priceLabel: item!.priceLabel,
      emoji: item!.emoji,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  const related = items
    .filter((i) => i.category === item.category && i.id !== item.id)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-5xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={`${PUBLIC_BASE}/catalog`}>
          <ArrowLeft className="size-4" /> Kembali ke katalog
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <Reveal variant="zoom">
          <div
            className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${item.gradient}`}
          >
            <span className="text-9xl drop-shadow-lg" aria-hidden>
              {item.emoji}
            </span>
            {item.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
        </Reveal>

        <Reveal delay={120} className="flex flex-col justify-center space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{item.category}</Badge>
            {item.badge && <Badge>{item.badge}</Badge>}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {item.name}
          </h1>
          <p className="text-2xl font-semibold tabular-nums">
            {item.priceLabel}
          </p>
          <p className="text-muted-foreground">{item.blurb}</p>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {unitPrice ? (
              <Button onClick={addToCart}>
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
            ) : (
              <Button asChild>
                <Link href={`${PUBLIC_BASE}/contact`}>Pesan via kontak</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href="tel:+6281234567890">
                <Phone className="size-4" /> Telepon kami
              </a>
            </Button>
          </div>

          <Accordion type="single" collapsible defaultValue="deskripsi" className="rounded-xl border border-border/60 bg-card/50 px-4">
            <AccordionItem value="deskripsi">
              <AccordionTrigger>Deskripsi produk</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.blurb} Kategori {item.category.toLowerCase()} — kualitas
                dijaga konsisten di semua outlet.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cara-order">
              <AccordionTrigger>Cara order</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Tambahkan ke keranjang lalu checkout, hubungi via WhatsApp, atau
                datang langsung ke outlet terdekat. Tim kami siap melayani
                setiap hari.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pembayaran">
              <AccordionTrigger>Pembayaran & pengiriman</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Mendukung QRIS, virtual account, dan e-wallet lewat checkout
                online. Pesanan diproses di hari yang sama — status bisa
                dilacak lewat halaman order.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Item lain di kategori {item.category}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`${PUBLIC_BASE}/catalog`}>
                Lihat semua <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Stagger itemClassName="h-full">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`${PUBLIC_BASE}/catalog/${r.slug}`}
                  className="group block h-full"
                >
                  <Card className="h-full overflow-hidden border-border/60 bg-card/50 transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg">
                    <div
                      className={`relative flex aspect-[5/3] items-center justify-center overflow-hidden bg-gradient-to-br ${r.gradient}`}
                    >
                      <span className="text-4xl" aria-hidden>
                        {r.emoji}
                      </span>
                      {r.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.image}
                          alt={r.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <CardContent className="space-y-1 p-4">
                      <p className="font-medium group-hover:underline">{r.name}</p>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {r.priceLabel}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </article>
  );
}
