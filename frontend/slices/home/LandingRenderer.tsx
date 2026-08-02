"use client";

import {
  HeroBlock,
  SectionHead,
  FeatureGrid,
  CtaBand,
} from "@/features/_shared";
import { LandingSectionShell } from "@/features/_shared/landing/LandingSectionShell";
import { parseConfigBadge } from "@/features/_shared/landing/parse-config";
import { resolveFeatureItems } from "./feature-config";
import {
  CustomSection,
  FaqSection,
  NewsletterSection,
  PricingSection,
  StatsSection,
  TestimonialsSection,
  parseConfigObject,
  cfgString,
} from "@/features/_shared/landing/sections";
import type { LandingSection } from "@/features/_shared/landing/types";
import { ADMIN_BASE, PUBLIC_BASE } from "@/features/_app/nav-config";
import type { Business, JournalEntry, Product, Review } from "@/features/_app/types";
import {
  JournalTeaser,
  WIRAUSAHA_CLIENTS,
  WIRAUSAHA_FAQS,
  WIRAUSAHA_STATS,
  WIRAUSAHA_TIERS,
} from "./LandingExtras";
import { BusinessShowcase, ProductShowcase } from "./LandingCases";

interface Deps {
  businesses: Business[];
  products: Product[];
  reviews: Review[];
  journal: JournalEntry[];
  onSubscribe?: (email: string) => Promise<{ ok: boolean; notice?: string }>;
}

/**
 * Maps each enabled landingSection.kind to its wirausaha renderer.
 * Admin-editable title/subtitle thread through; unknown kinds render a
 * minimal stub so admin still sees them without crashing the page.
 */
export function renderLanding(section: LandingSection, deps: Deps) {
  switch (section.kind) {
    case "hero": {
      const cfg = parseConfigObject(section.config);
      return (
        <LandingSectionShell section={section}>
          <HeroBlock
            glow
            align={cfgString(cfg, "align") === "center" ? "center" : "left"}
            badge={parseConfigBadge(section.config) ?? "Untuk wirausaha multi-unit"}
            title={section.title}
            subtitle={section.subtitle}
            primaryCta={{
              label: cfgString(cfg, "ctaPrimaryLabel") ?? "Buka workspace",
              href: cfgString(cfg, "ctaPrimaryHref") ?? ADMIN_BASE,
            }}
            secondaryCta={{
              label: cfgString(cfg, "ctaSecondaryLabel") ?? "Hubungi kami",
              href: cfgString(cfg, "ctaSecondaryHref") ?? `${PUBLIC_BASE}/contact`,
            }}
            image={section.imageUrl ? { url: section.imageUrl, ratio: section.imageRatio } : undefined}
            layers={section.layers}
            background={section.bgImageUrl}
            shade={section.shade}
          />
        </LandingSectionShell>
      );
    }

    case "features":
      return (
        <LandingSectionShell section={section} defaultClassName="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="Fitur"
            title={section.title}
            subtitle={section.subtitle}
          />
          <FeatureGrid items={resolveFeatureItems(section.config)} columns={4} className="mt-10" />
        </LandingSectionShell>
      );

    case "portfolio":
      return (
        <LandingSectionShell section={section} defaultClassName="border-y border-border/50 bg-muted/10">
          <BusinessShowcase section={section} businesses={deps.businesses} />
        </LandingSectionShell>
      );

    case "services":
      return (
        <LandingSectionShell section={section} defaultClassName="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <ProductShowcase section={section} products={deps.products} />
        </LandingSectionShell>
      );

    case "cta":
      return (
        <LandingSectionShell section={section}>
          <CtaBand
            title={section.title}
            subtitle={section.subtitle ?? "Demo workspace dalam 5 menit."}
            cta={{ label: "Mulai sekarang", href: ADMIN_BASE }}
          />
        </LandingSectionShell>
      );

    case "stats":
      return (
        <LandingSectionShell section={section} defaultClassName="border-y border-border/50 bg-muted/10">
          <StatsSection section={section} stats={WIRAUSAHA_STATS} clients={WIRAUSAHA_CLIENTS} />
        </LandingSectionShell>
      );

    case "testimonials":
      return (
        <LandingSectionShell section={section}>
          <TestimonialsSection
            section={section}
            items={deps.reviews.map((r) => ({
              quote: r.body,
              author: r.author,
              role: `${r.category} · ${r.city}`,
              rating: r.rating,
            }))}
          />
        </LandingSectionShell>
      );

    case "pricing":
      return (
        <LandingSectionShell section={section} defaultClassName="border-y border-border/50 bg-muted/10">
          <PricingSection section={section} tiers={WIRAUSAHA_TIERS} />
        </LandingSectionShell>
      );

    case "faq":
      return (
        <LandingSectionShell section={section}>
          <FaqSection
            section={section}
            items={WIRAUSAHA_FAQS}
            ctaLabel="Hubungi kami"
            ctaHref={`${PUBLIC_BASE}/contact`}
          />
        </LandingSectionShell>
      );

    case "blog":
    case "changelog":
      return (
        <LandingSectionShell section={section} defaultClassName="border-t border-border/50">
          <JournalTeaser section={section} entries={deps.journal} />
        </LandingSectionShell>
      );

    case "newsletter":
      return (
        <LandingSectionShell section={section}>
          <NewsletterSection section={section} placeholder="Email kamu" buttonLabel="Ikut info promo" onSubscribe={deps.onSubscribe} />
        </LandingSectionShell>
      );

    case "custom":
      return (
        <LandingSectionShell section={section}>
          <CustomSection section={section} />
        </LandingSectionShell>
      );

    default:
      return null;
  }
}

