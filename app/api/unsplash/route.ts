import { NextResponse } from "next/server";
import type { UnsplashPhoto } from "@/features/image-picker";

/**
 * Server-side Unsplash search proxy for the image-picker slice.
 * Holds UNSPLASH_ACCESS_KEY (never exposed to the client). When the key
 * is not set the picker still works — it falls back to its bundled
 * curated set — so this route degrades gracefully by returning an empty
 * result with a notice instead of erroring.
 */
export const runtime = "nodejs";

export async function GET(req: Request) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return NextResponse.json({
      photos: [],
      error: "UNSPLASH_ACCESS_KEY not set — using curated set only.",
    });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";
  const perPage = searchParams.get("per_page") ?? "24";

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query,
      )}&per_page=${perPage}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` } },
    );
    if (!res.ok) {
      return NextResponse.json({ photos: [], error: `Unsplash ${res.status}` });
    }
    const data = (await res.json()) as { results?: unknown[] };
    const photos: UnsplashPhoto[] = (data.results ?? []).map((r) => {
      const p = r as Record<string, any>;
      return {
        id: String(p.id),
        regular: p.urls?.regular,
        thumb: p.urls?.thumb,
        full: p.urls?.full,
        width: p.width,
        height: p.height,
        alt: p.alt_description ?? p.description ?? query,
        photographer: p.user?.name ?? "Unknown",
        photographerUrl: p.user?.links?.html ?? "https://unsplash.com",
        source: p.links?.html ?? "https://unsplash.com",
      };
    });
    return NextResponse.json({ photos, total: photos.length });
  } catch (e) {
    return NextResponse.json({
      photos: [],
      error: `Network error: ${(e as Error).message}`,
    });
  }
}
