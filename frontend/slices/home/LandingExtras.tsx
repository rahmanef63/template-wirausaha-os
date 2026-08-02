"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/features/_shared/ui/section-head";
import { Stagger } from "@/features/_shared/motion";
import {
  cfgNumber,
  parseConfigObject,
  type FaqItem,
  type PricingTier,
  type StatItem,
} from "@/features/_shared/landing/sections";
import type { LandingSection } from "@/features/_shared/landing/types";
import { fmtDate } from "@/features/_app/store";
import { PUBLIC_BASE } from "@/features/_app/nav-config";
import type { JournalEntry } from "@/features/_app/types";
import { STATS, CLIENTS, FAQS, PRICING } from "@/convex/landingContent";

/** Wirausaha default landing content lives in convex/landingContent.ts — the
 *  SINGLE source the seed also reads (it writes the same content into Convex
 *  config). These re-exports are the render fallback before the seed runs;
 *  edit the content in that module, not here. */

export const WIRAUSAHA_STATS: StatItem[] = STATS;
export const WIRAUSAHA_CLIENTS = CLIENTS;
export const WIRAUSAHA_FAQS: FaqItem[] = FAQS;
export const WIRAUSAHA_TIERS: PricingTier[] = PRICING;

/** Latest journal entries teaser — backs the "blog"/"changelog" landing
 *  kinds with real store data (admin CRUD via /admin → Konten Situs). */
export function JournalTeaser({
  section,
  entries,
}: {
  section: LandingSection;
  entries: JournalEntry[];
}) {
  const limit = cfgNumber(parseConfigObject(section.config), "limit") ?? 3;
  const latest = [...entries]
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, limit);
  if (latest.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionHead
        eyebrow="Jurnal"
        title={section.title}
        subtitle={section.subtitle}
        cta={{ label: "Semua tulisan", href: `${PUBLIC_BASE}/journal` }}
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stagger itemClassName="h-full">
          {latest.map((e) => (
            <Link key={e.id} href={`${PUBLIC_BASE}/journal/${e.slug}`} className="group block h-full">
              <Card className="h-full overflow-hidden border-border/60 bg-card/50 transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg">
                <div className={`flex aspect-[5/2] items-center justify-center bg-gradient-to-br ${e.gradient}`}>
                  <span className="text-5xl drop-shadow-md" aria-hidden>{e.emoji}</span>
                </div>
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{e.category}</Badge>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="size-3" /> {fmtDate(e.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-medium leading-snug group-hover:underline">{e.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{e.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Stagger>
      </div>
      <div className="mt-8 text-center sm:hidden">
        <Button asChild variant="outline" size="sm">
          <Link href={`${PUBLIC_BASE}/journal`}>
            Semua tulisan <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
