"use node";

/**
 * ai-chat backend — real LLM call via the Vercel `ai` SDK + @ai-sdk/anthropic.
 *
 * Key-guarded: ANTHROPIC_API_KEY is set by the site owner on the Convex
 * deployment at deploy time. When it is NOT set the action does NOT throw —
 * it returns `{ ok: false, notice }` so the chat UI degrades gracefully and
 * the build / prerender never depends on the key being present.
 *
 * wirausaha has no `aiConfig` singleton, so the system prompt uses a sensible
 * default that makes the public assistant speak as a friendly UMKM (small
 * business) front-desk assistant in Bahasa Indonesia, mirroring the site copy.
 */

import { action } from "../../_generated/server";
import { v } from "convex/values";

const MODEL = "claude-3-5-haiku-latest";

const DEFAULT_SYSTEM = [
  "Kamu adalah asisten virtual untuk sebuah bisnis UMKM (usaha mikro, kecil, menengah).",
  "Bahasamu ramah, ringkas, membumi, dan dalam Bahasa Indonesia.",
  "Bantu calon pelanggan memahami produk & layanan, promo yang berjalan,",
  "cara memesan, dan lokasi outlet. Arahkan ke halaman Katalog, Jurnal, atau Kontak bila perlu.",
  "Jangan mengarang harga pasti di luar yang tertera — tawarkan untuk menghubungi tim atau datang ke outlet.",
].join(" ");

export const chat = action({
  args: {
    prompt: v.string(),
    history: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        }),
      ),
    ),
  },
  handler: async (
    _ctx,
    { prompt, history },
  ): Promise<{ ok: boolean; text?: string; notice?: string }> => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return {
        ok: false,
        notice:
          "AI chat belum dikonfigurasi. Pemilik situs harus mengatur ANTHROPIC_API_KEY pada deployment Convex untuk mengaktifkan balasan langsung.",
      };
    }

    try {
      const { generateText } = await import("ai");
      const { createAnthropic } = await import("@ai-sdk/anthropic");
      const anthropic = createAnthropic({ apiKey: key });

      const messages = [
        ...(history ?? []),
        { role: "user" as const, content: prompt },
      ];

      const { text } = await generateText({
        model: anthropic(MODEL),
        system: DEFAULT_SYSTEM,
        messages,
        maxTokens: 600,
      });

      return { ok: true, text };
    } catch (e) {
      return {
        ok: false,
        notice: `Permintaan AI gagal: ${(e as Error).message}`,
      };
    }
  },
});
