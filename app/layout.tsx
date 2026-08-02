import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ConvexClientProvider } from "@/components/convex-provider";
import { ThemeProviders } from "@/components/theme-providers";
import { Toaster } from "sonner";
import { IS_DEMO } from "@/lib/stage";
import { DemoShell } from "@/features/_shared/demo-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const DEFAULT_NAME = "Wirausaha OS";
const DEFAULT_DESC =
  "Website OS untuk UMKM, brand lokal & wirausahawan — katalog produk, journal + staff, dashboard bisnis. Template gratis, clone-to-own.";

// SEO/OG <head> driven by the owner's Convex settings (server-side, so social
// scrapers + crawlers that don't run JS see the real brand). Falls back to the
// template defaults when settings are unset or the query fails.
export async function generateMetadata(): Promise<Metadata> {
  const s = await fetchQuery(api.settings.get, {}).catch(() => null);
  const name = s?.siteName || DEFAULT_NAME;
  const description = s?.seoDescription || DEFAULT_DESC;
  const image = s?.logoUrl || undefined;
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
    ),
    title: { default: name, template: `%s — ${name}` },
    description,
    openGraph: {
      title: name,
      description,
      type: "website",
      siteName: name,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProviders>
          <Suspense fallback={null}>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </Suspense>
          {/* DEMO-only interactive shell (Public/Admin/Split). Gated here so
              real clones never even mount the client component. */}
          {IS_DEMO && <DemoShell />}
        </ThemeProviders>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
