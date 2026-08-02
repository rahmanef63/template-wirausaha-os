"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/features/_shared/ui/section-head";
import { Stagger } from "@/features/_shared/motion";
import type { LandingSection } from "@/features/_shared/landing/types";
import { PUBLIC_BASE } from "@/features/_app/nav-config";
import type { Business, Product } from "@/features/_app/types";

/** Business-unit card grid — backs the "portfolio" landing kind with real
 *  store data (admin CRUD). Title/subtitle thread through from the section. */
export function BusinessShowcase({
  section,
  businesses,
}: {
  section: LandingSection;
  businesses: Business[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHead
        eyebrow="Unit usaha"
        title={section.title}
        subtitle={section.subtitle}
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stagger itemClassName="h-full">
        {businesses.map((b) => (
          <Card key={b.id} className="h-full border-border/60 bg-card/60 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="space-y-2 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full text-[10px]">{b.type}</Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">{b.city}</Badge>
              </div>
              <h3 className="text-base font-medium">{b.name}</h3>
              <p className="text-sm text-muted-foreground">{b.staffCount} staff aktif</p>
              <p className="pt-1 text-[11px] text-muted-foreground">
                Revenue bulanan: Rp {(b.monthlyRevenue / 1_000_000).toFixed(1)}jt
              </p>
            </CardContent>
          </Card>
        ))}
        </Stagger>
      </div>
    </div>
  );
}

/** Product/catalog card grid — backs the "services" landing kind. Renders
 *  directly inside the section shell (shell supplies the max-w wrapper). */
export function ProductShowcase({
  section,
  products,
}: {
  section: LandingSection;
  products: Product[];
}) {
  return (
    <>
      <SectionHead
        eyebrow="Katalog"
        title={section.title}
        subtitle={section.subtitle}
        cta={{ label: "Lihat semua", href: `${PUBLIC_BASE}/services` }}
      />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stagger itemClassName="h-full">
          {products.slice(0, 6).map((p) => (
            <Card key={p.id} className="h-full border-border/60 bg-card/60 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="space-y-1 p-4">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                <p className="text-base font-semibold">{p.priceLabel}</p>
                <p className="text-[11px] text-muted-foreground">Stok: {p.stock} {p.unit}</p>
              </CardContent>
            </Card>
          ))}
        </Stagger>
      </div>
    </>
  );
}
