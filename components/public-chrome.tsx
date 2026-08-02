"use client";

import { type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteShell } from "@/features/_shared/ui/site-shell";
import { parseSocials } from "@/features/_shared/ui/site-footer";
import { ThemePresetSwitcher } from "@/features/theme-presets";
import { CartWidget } from "@/features/storefront-checkout";
import { DEFAULT_SITE_CONFIG } from "@/features/_app/site-config";
import {
  FOOTER_COLUMNS,
  FOOTER_TAGLINE,
  PUBLIC_BASE,
  PUBLIC_CTA,
  PUBLIC_NAV,
} from "@/features/_app/nav-config";

/**
 * Public chrome (nav + footer) with owner branding applied at runtime — brand
 * name + uploaded logo come from Convex `siteSettings` (admin Settings /
 * onboarding), falling back to template defaults before load. Mirrors the
 * personal-brand-os reference so the home landing reflects dashboard edits.
 */
export function PublicChrome({ children }: { children: ReactNode }) {
  const s = useQuery(api.settings.get);
  const brandName = s?.siteName || DEFAULT_SITE_CONFIG.brandName;
  const brand = {
    ...DEFAULT_SITE_CONFIG,
    brandName,
    brandLetter: brandName.charAt(0).toUpperCase() || DEFAULT_SITE_CONFIG.brandLetter,
    logoUrl: s?.logoUrl,
  };
  const tagline = s?.tagline || FOOTER_TAGLINE;

  return (
    <SiteShell
      brand={brand}
      homeHref={PUBLIC_BASE}
      navItems={PUBLIC_NAV}
      cta={PUBLIC_CTA}
      navExtras={
        <>
          <CartWidget checkoutHref={`${PUBLIC_BASE}/checkout`} />
          <ThemePresetSwitcher />
        </>
      }
      footerColumns={FOOTER_COLUMNS}
      footerTagline={tagline}
      footerSocials={parseSocials(s?.socials)}
      copyrightHolder={brand.brandName}
    >
      {children}
    </SiteShell>
  );
}
