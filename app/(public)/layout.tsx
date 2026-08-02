import type { Metadata } from "next";
import { AiChatFab } from "@/components/ai-chat-fab";
import { Suspense, type ReactNode } from "react";
import { SiteShell } from "@/features/_shared/ui/site-shell";
import { PublicChrome } from "@/components/public-chrome";
import { ThemePresetSwitcher } from "@/features/theme-presets";
import { CartProvider, CartWidget } from "@/features/storefront-checkout";
import { StoreProvider } from "@/features/_app/store";
import { SiteLoader } from "@/components/site-loader";
import { DEFAULT_SITE_CONFIG } from "@/features/_app/site-config";
import {
  FOOTER_COLUMNS,
  FOOTER_TAGLINE,
  PUBLIC_BASE,
  PUBLIC_CTA,
  PUBLIC_NAV,
} from "@/features/_app/nav-config";

const c = DEFAULT_SITE_CONFIG;

/** Demo/clone-aware canonical origin — env wins over the seeded
 *  site-config domain so og/canonical URLs always match the real host. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : c.baseUrl);

export const metadata: Metadata = {
  title: { default: `${c.brandName} — ${c.tagline}`, template: `%s — ${c.brandName}` },
  description: c.description,
  applicationName: c.brandName,
  authors: [{ name: c.ownerName }],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: c.brandName,
    title: `${c.brandName} — ${c.tagline}`,
    description: c.description,
    url: SITE_URL,
    images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: "Wirausaha OS" }],
    locale: c.defaultLocale,
  },
  twitter: { card: "summary_large_image", site: c.twitter, creator: c.twitter },
  themeColor: c.themeColor,
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
      <CartProvider storageKey="wirausaha-cart">
      <SiteLoader brandLetter={DEFAULT_SITE_CONFIG.brandLetter} />
        <PublicChrome>{children}</PublicChrome>
        <AiChatFab brand={DEFAULT_SITE_CONFIG.brandName} />
      </CartProvider>
        </StoreProvider>
    </Suspense>
  );
}
