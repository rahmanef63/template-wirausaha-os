// SINGLE SOURCE of wirausaha's landing example content.
//
// Imported by BOTH:
//  - convex/seed.ts → seeds each item section's `config` into landingSections,
//    so a fresh clone gets EDITABLE example data in the admin landing editor
//    (not just code-only defaults).
//  - frontend/slices/home/* → the render fallback (used before the seed runs).
//
// MUST stay framework-pure: no convex/server, no convex/values, no React/lucide
// imports — only literals + plain types — so the Convex bundler AND the Next
// client can both import it. Feature icons are lucide NAMES (string), resolved
// to components in feature-config.ts. Hrefs are root-relative (publicBase = "").
//
// Edit content HERE once; the seed and the render both follow. No drift.

export type LcStat = { value: number; prefix?: string; suffix?: string; label: string };
export type LcFeature = { icon: string; title: string; blurb: string };
export type LcTier = {
  name: string;
  price: string;
  period?: string;
  blurb?: string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
  featured?: boolean;
};
export type LcFaq = { q: string; a: string };

export const HERO = {
  title: "Kelola banyak unit usaha dari satu workspace.",
  subtitle:
    "Inventory, order, finance, staff — semua jadi satu. AI bantu narasi laporan bulanan dalam bahasa Indonesia.",
  badge: "Untuk wirausaha multi-unit",
};

export const STATS: LcStat[] = [
  { value: 3, label: "Unit usaha aktif" },
  { value: 12, suffix: " outlet", label: "Titik layanan" },
  { value: 4800, suffix: "+", label: "Order diproses" },
  { value: 98, suffix: "%", label: "Pelanggan kembali" },
];

export const CLIENTS: string[] = [
  "Kopi Pagi Hari",
  "Warung Bu Sari",
  "Laundry Kilat",
  "Toko Berkah",
  "Catering Selera",
  "Bengkel Maju",
];

export const FEATURES: LcFeature[] = [
  { icon: "Building2", title: "Multi-unit", blurb: "Kelola banyak warung/toko/jasa dari satu dashboard." },
  { icon: "Package", title: "Inventory live", blurb: "Stok update real-time, alert otomatis sebelum habis." },
  { icon: "ShoppingCart", title: "Order tracking", blurb: "Status order dari new → delivered tercatat lengkap." },
  { icon: "Wallet", title: "Finance + AI", blurb: "Catat income/expense, AI bantu narasi laporan bulanan." },
];

export const PRICING: LcTier[] = [
  {
    name: "Eceran",
    price: "Harga katalog",
    blurb: "Belanja satuan langsung dari katalog online.",
    features: ["Checkout QRIS / VA / e-wallet", "Lacak pesanan real-time", "Ambil di outlet atau antar"],
    ctaLabel: "Lihat katalog",
    ctaHref: "/catalog",
  },
  {
    name: "Langganan",
    price: "Hemat 10%",
    period: "/bulan",
    blurb: "Kebutuhan rutin dikirim terjadwal tanpa perlu order ulang.",
    features: ["Pengiriman terjadwal mingguan", "Prioritas stok saat ramai", "Bisa ubah / jeda kapan saja", "Gratis ongkir area kota"],
    featured: true,
    ctaLabel: "Mulai langganan",
    ctaHref: "/contact",
  },
  {
    name: "Grosir & Katering",
    price: "Penawaran khusus",
    blurb: "Untuk reseller, acara, dan kebutuhan kantor.",
    features: ["Harga grosir bertingkat", "Invoice + tempo untuk bisnis", "PIC khusus yang siaga"],
    ctaLabel: "Hubungi tim",
    ctaHref: "/contact",
  },
];

export const FAQS: LcFaq[] = [
  { q: "Apakah bisa pesan antar?", a: "Bisa. Checkout online mendukung pengiriman lokal, atau hubungi outlet terdekat untuk antar langsung di hari yang sama." },
  { q: "Metode pembayaran apa saja yang didukung?", a: "QRIS, virtual account semua bank besar, dan e-wallet (OVO, GoPay, DANA, ShopeePay) lewat checkout online — atau tunai di outlet." },
  { q: "Bagaimana cara melacak pesanan saya?", a: "Setelah checkout kamu diarahkan ke halaman lacak pesanan. Simpan link-nya — status pembayaran sampai pengiriman update otomatis di sana." },
  { q: "Apakah melayani pesanan grosir atau katering?", a: "Ya. Untuk jumlah besar, harga grosir, atau langganan bulanan, hubungi tim kami lewat halaman kontak — kami balas cepat." },
  { q: "Jam operasional outlet?", a: "Mayoritas outlet buka 08.00–21.00 setiap hari. Detail per outlet ada di halaman Outlet." },
];
