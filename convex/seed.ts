import { mutation, internalMutation } from "./_generated/server";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUser } from "./_shared/auth";
import { HERO, STATS, CLIENTS, FEATURES, PRICING, FAQS } from "./landingContent";

// Demo seed for Wirausaha OS.
// - `seed:run`        — CLI/power use: wipes content then inserts (npx convex run seed:run).
// - `seed:seedSample` — in-app one-click for non-coders: requires login, inserts
//                       ONLY when the site is still empty (never wipes real work).
//
// Data mirrors components/templates/wirausaha/shared/{seed,pages-seed,data/*}.ts
// (the former localStorage SEED_STATE), converted to Convex inserts. Content uses
// plain string ids for cross-entity links (businessId/customerId/productId), so
// no FK remap is needed on insert/restore.
const now = 1_780_000_000_000;
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;
const min = (n: number) => now - n * 60 * 1000;

const BUSINESSES = [
  { name: "Warung Kopi Senja", type: "Kuliner", city: "Bandung", staffCount: 5, monthlyRevenue: 38_400_000, status: "active" as const },
  { name: "Toko Bahan Sejahtera", type: "Retail", city: "Surabaya", staffCount: 3, monthlyRevenue: 22_800_000, status: "active" as const },
  { name: "Cuci Bersih Express", type: "Jasa", city: "Jakarta", staffCount: 4, monthlyRevenue: 18_200_000, status: "active" as const },
];

const PRODUCTS = [
  { businessId: "biz-1", name: "Kopi Susu Gula Aren", sku: "KSG-01", priceLabel: "Rp 22k", stock: 120, unit: "porsi" },
  { businessId: "biz-1", name: "Roti Bakar Coklat", sku: "RBC-02", priceLabel: "Rp 18k", stock: 60, unit: "porsi" },
  { businessId: "biz-2", name: "Tepung Terigu 1kg", sku: "TT-001", priceLabel: "Rp 14k", stock: 240, unit: "pcs" },
  { businessId: "biz-3", name: "Cuci Setrika 1kg", sku: "CSI-1", priceLabel: "Rp 7k", stock: 999, unit: "kg" },
];

const CUSTOMERS = [
  { name: "Budi Santoso", phone: "+62 812-3456-7890", city: "Bandung", totalSpentLabel: "Rp 1.4jt", orderCount: 18 },
  { name: "Siti Aminah", phone: "+62 821-2345-6789", city: "Surabaya", totalSpentLabel: "Rp 480k", orderCount: 6 },
  { name: "Linda Kusuma", phone: "+62 813-4567-8901", city: "Jakarta", totalSpentLabel: "Rp 920k", orderCount: 12 },
];

const ORDERS = [
  { businessId: "biz-1", customerId: "cust-1", items: [{ productId: "p-1", qty: 2, priceLabel: "Rp 22k" }, { productId: "p-2", qty: 1, priceLabel: "Rp 18k" }], totalLabel: "Rp 62k", status: "delivered" as const, ts: day(0) },
  { businessId: "biz-2", customerId: "cust-2", items: [{ productId: "p-3", qty: 5, priceLabel: "Rp 14k" }], totalLabel: "Rp 70k", status: "processing" as const, ts: min(30) },
  { businessId: "biz-3", customerId: "cust-3", items: [{ productId: "p-4", qty: 4, priceLabel: "Rp 7k" }], totalLabel: "Rp 28k", status: "new" as const, ts: min(12) },
];

const FINANCE = [
  { businessId: "biz-1", kind: "income" as const, category: "Penjualan harian", amountLabel: "Rp 1.2jt", note: "Total kasir Senin", ts: day(0) },
  { businessId: "biz-1", kind: "expense" as const, category: "Bahan baku", amountLabel: "Rp 480k", note: "Beli kopi + susu", ts: day(1) },
  { businessId: "biz-2", kind: "income" as const, category: "Penjualan", amountLabel: "Rp 760k", note: "—", ts: day(0) },
  { businessId: "biz-3", kind: "expense" as const, category: "Listrik", amountLabel: "Rp 320k", note: "Tagihan bulanan", ts: day(2) },
];

const STAFF = [
  { businessId: "biz-1", name: "Aditya Pratama", role: "Barista", phone: "+62 813-1111-1111", joinedAt: day(120) },
  { businessId: "biz-1", name: "Rina Wijaya", role: "Kasir", phone: "+62 813-2222-2222", joinedAt: day(60) },
  { businessId: "biz-2", name: "Bayu Hartono", role: "Penjaga toko", phone: "+62 813-3333-3333", joinedAt: day(180) },
  { businessId: "biz-3", name: "Sari Pertiwi", role: "Operator", phone: "+62 813-4444-4444", joinedAt: day(40) },
];

const CATALOG = [
  { productId: "p-1", slug: "kopi-susu-gula-aren", price: 22000, name: "Kopi Susu Gula Aren", category: "Kuliner", priceLabel: "Rp 22.000", blurb: "Espresso single-origin Garut diseimbangkan susu segar dan gula aren cair. Manis bumi, finish bersih.", badge: "Best seller", emoji: "☕", gradient: "from-amber-500 via-orange-500 to-rose-500", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80" },
  { productId: "p-2", slug: "roti-bakar-coklat", price: 18000, name: "Roti Bakar Coklat Lumer", category: "Kuliner", priceLabel: "Rp 18.000", blurb: "Roti panggang dengan coklat Belgia leleh. Cocok untuk teman ngopi sore.", emoji: "🍞", gradient: "from-amber-700 via-amber-500 to-yellow-300", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80" },
  { productId: "p-3", slug: "tepung-terigu-1kg", price: 14000, name: "Tepung Terigu Premium 1 kg", category: "Retail", priceLabel: "Rp 14.000", blurb: "Tepung serbaguna protein sedang — ideal untuk roti, kue, dan gorengan rumahan.", emoji: "🌾", gradient: "from-yellow-300 via-amber-200 to-stone-300", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" },
  { productId: "p-4", slug: "cuci-setrika-1kg", price: 7000, name: "Cuci & Setrika per kg", category: "Jasa", priceLabel: "Rp 7.000 / kg", blurb: "Layanan cuci kiloan plus setrika rapi. Selesai 24 jam, antar-jemput gratis radius 3 km.", badge: "Antar-jemput", emoji: "🧺", gradient: "from-sky-500 via-cyan-400 to-teal-400", image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80" },
  { slug: "paket-hemat-pagi", price: 28000, name: "Paket Hemat Pagi", category: "Paket", priceLabel: "Rp 28.000", blurb: "Kopi susu + roti bakar + air mineral. Hemat 8 ribu, tersedia jam 07.00–10.00.", badge: "Promo", emoji: "🥐", gradient: "from-emerald-500 via-teal-500 to-cyan-500" },
  { slug: "voucher-laundry-10kg", price: 60000, name: "Voucher Laundry 10 kg", category: "Promo", priceLabel: "Rp 60.000", blurb: "Hemat 10 ribu dari harga normal. Voucher berlaku 30 hari, bisa dipakai bertahap.", emoji: "🎟️", gradient: "from-rose-500 via-pink-500 to-fuchsia-500" },
  { slug: "sembako-mingguan", price: 145000, name: "Paket Sembako Mingguan", category: "Retail", priceLabel: "Rp 145.000", blurb: "Beras 5kg, minyak 2L, gula 1kg, telur 1kg. Cocok untuk keluarga kecil.", emoji: "🛒", gradient: "from-lime-500 via-green-500 to-emerald-600" },
  { slug: "katering-rapat", price: 320000, name: "Katering Rapat 10 Pax", category: "Jasa", priceLabel: "Rp 320.000", blurb: "Nasi box lengkap + 2 snack + air mineral. Minimal order H-1, gratis antar dalam kota.", emoji: "🍱", gradient: "from-orange-500 via-red-500 to-rose-600" },
];

const STORES = [
  { businessId: "biz-1", name: "Warung Kopi Senja — Cabang Dago", city: "Bandung", address: "Jl. Ir. H. Djuanda No. 142, Dago, Bandung 40132", phone: "+62 812-3456-7890", hours: "Sen–Min · 07:00 – 23:00", mapsUrl: "https://maps.google.com/?q=Dago+Bandung", emoji: "☕", gradient: "from-amber-500 to-rose-500" },
  { businessId: "biz-1", name: "Warung Kopi Senja — Braga", city: "Bandung", address: "Jl. Braga No. 88, Sumur Bandung, Bandung 40111", phone: "+62 812-3456-7891", hours: "Sen–Min · 08:00 – 22:00", mapsUrl: "https://maps.google.com/?q=Braga+Bandung", emoji: "🏪", gradient: "from-orange-500 to-amber-600" },
  { businessId: "biz-2", name: "Toko Bahan Sejahtera — Rungkut", city: "Surabaya", address: "Jl. Raya Rungkut Industri No. 24, Surabaya 60293", phone: "+62 813-2222-3333", hours: "Sen–Sab · 07:00 – 20:00 · Min · 09:00 – 16:00", mapsUrl: "https://maps.google.com/?q=Rungkut+Surabaya", emoji: "🌾", gradient: "from-yellow-400 to-amber-500" },
  { businessId: "biz-3", name: "Cuci Bersih Express — Tebet", city: "Jakarta", address: "Jl. Tebet Raya No. 56, Tebet, Jakarta Selatan 12810", phone: "+62 813-4444-5555", hours: "Setiap hari · 06:00 – 21:00", mapsUrl: "https://maps.google.com/?q=Tebet+Jakarta", emoji: "🧺", gradient: "from-sky-500 to-teal-500" },
];

const JOURNAL = [
  { slug: "promo-paket-hemat-pagi", title: "Promo Paket Hemat Pagi: Hemat 8 Ribu Setiap Hari", excerpt: "Mulai 1 Juni, paket kopi + roti bakar + air mineral tersedia hanya Rp 28.000 dari jam 7 sampai 10 pagi.", body: "Kabar gembira buat pelanggan pagi! Kami baru saja meluncurkan Paket Hemat Pagi yang menggabungkan tiga menu favorit dalam satu harga spesial.\n\nPaket ini berisi Kopi Susu Gula Aren, Roti Bakar Coklat Lumer, dan satu botol air mineral. Total harga normal Rp 36.000, tapi dalam paket hanya Rp 28.000 — hemat 8 ribu tiap pembelian.\n\nPromo berlaku Senin sampai Minggu, jam 07.00–10.00, di semua outlet Warung Kopi Senja. Bisa dine-in atau take away. Tidak bisa digabung dengan voucher lain.", category: "Promo", author: "Tim Wirausaha OS", publishedAt: day(2), emoji: "🥐", gradient: "from-emerald-500 via-teal-500 to-cyan-500" },
  { slug: "outlet-baru-braga", title: "Outlet Baru Warung Kopi Senja Hadir di Braga", excerpt: "Cabang kedua di Bandung resmi buka 15 Mei. Konsep heritage, kapasitas 40 kursi, ada area kerja.", body: "Setelah outlet Dago jadi favorit warga Bandung utara, kami membuka cabang kedua di Jl. Braga No. 88 — kawasan heritage yang ikonik.\n\nOutlet baru mengusung konsep ruang kerja casual: 40 kursi, 8 colokan listrik di setiap meja, dan Wi-Fi 100 Mbps gratis. Cocok untuk freelancer, mahasiswa, atau meeting kecil.\n\nMenu sama seperti outlet Dago, plus dua item eksklusif: Es Kopi Susu Braga (gula aren + secangkir es serut) dan Roti Bakar Keju Asin. Jam buka 08.00–22.00 setiap hari.", category: "Liputan", author: "Tim Wirausaha OS", publishedAt: day(8), emoji: "🏪", gradient: "from-orange-500 to-amber-600" },
  { slug: "produk-baru-paket-sembako", title: "Produk Baru: Paket Sembako Mingguan untuk Keluarga", excerpt: "Toko Bahan Sejahtera Surabaya meluncurkan paket sembako lengkap Rp 145.000. Antar gratis radius 5 km.", body: "Banyak pelanggan minta paket sembako siap antar untuk hemat waktu belanja mingguan. Kami dengarkan — dan inilah jawabannya.\n\nPaket Sembako Mingguan berisi: beras premium 5 kg, minyak goreng 2 liter, gula pasir 1 kg, dan telur ayam 1 kg. Total Rp 145.000, sudah termasuk packing rapi.\n\nUntuk wilayah Surabaya Timur (radius 5 km dari Rungkut), kami sediakan antar gratis. Pesan via WhatsApp sebelum jam 14:00, barang sampai hari yang sama. Cocok untuk keluarga kecil 3–4 orang per minggu.", category: "Produk Baru", author: "Tim Wirausaha OS", publishedAt: day(14), emoji: "🛒", gradient: "from-lime-500 via-green-500 to-emerald-600" },
  { slug: "voucher-laundry-30-hari", title: "Voucher Laundry 10 kg Berlaku 30 Hari", excerpt: "Hemat Rp 10.000 dari harga reguler. Bisa dipakai bertahap, cocok buat pelanggan rutin mingguan.", body: "Buat pelanggan setia Cuci Bersih Express, kami siapkan voucher hemat yang fleksibel.\n\nDengan Rp 60.000, kamu dapat saldo 10 kg laundry (cuci + setrika) yang bisa dipakai bertahap selama 30 hari. Harga reguler Rp 7.000/kg, jadi total normalnya Rp 70.000 — hemat 10 ribu langsung.\n\nVoucher cocok untuk keluarga atau anak kost yang rutin laundry mingguan. Tunjukkan kode voucher di WhatsApp saat order, sistem auto-potong saldo. Sisa saldo bisa diperpanjang dengan top-up.", category: "Promo", author: "Tim Wirausaha OS", publishedAt: day(20), emoji: "🎟️", gradient: "from-rose-500 via-pink-500 to-fuchsia-500" },
  { slug: "tips-kelola-multi-unit", title: "5 Tips Kelola Banyak Unit Usaha Tanpa Kewalahan", excerpt: "Punya 3 unit usaha berbeda jenis? Berikut workflow yang kami pakai untuk tetap waras dan profit.", body: "Kelola tiga unit usaha — kuliner, retail, jasa — punya tantangan beda dari kelola satu bisnis besar. Berikut yang kami pelajari setahun terakhir.\n\nPertama, pisahkan kas tiap unit. Jangan campur, sekalipun pemiliknya satu. Kedua, standardisasi laporan harian — 5 angka kunci saja: omzet, biaya bahan, gaji harian, kas masuk, kas keluar.\n\nKetiga, percayakan operasi harian ke supervisor per unit. Pemilik fokus ke kontrol mingguan + keputusan strategis. Keempat, gunakan satu dashboard yang tampilkan semua unit sekaligus — supaya bisa banding-bandingkan performance. Kelima, alokasi waktu fixed: 1 hari kunjungan lapangan tiap unit per minggu, tidak boleh skip.", category: "Tips", author: "Tim Wirausaha OS", publishedAt: day(28), emoji: "💡", gradient: "from-violet-500 via-purple-500 to-fuchsia-500" },
];

const REVIEWS = [
  { author: "Dewi Anggraeni", city: "Bandung", category: "Kuliner", storeId: "store-1", rating: 5, body: "Kopi susu gula arennya juara, bukan terlalu manis. Tempatnya cozy, colokan di tiap meja jadi sering kerja di sini. Mbak baristanya juga ramah banget.", emoji: "☕", publishedAt: day(2) },
  { author: "Hendra Wijaya", city: "Bandung", category: "Kuliner", storeId: "store-2", rating: 5, body: "Outlet Braga konsepnya ikonik banget, cocok buat meeting santai. Roti bakar coklatnya lumer, ngga lebay manisnya. Pasti balik lagi.", emoji: "🍞", publishedAt: day(5) },
  { author: "Siti Aminah", city: "Surabaya", category: "Retail", storeId: "store-3", rating: 4, body: "Paket sembako mingguan praktis banget buat keluarga kecil. Beras kualitas oke, telur masih segar. Antar tepat waktu, kurirnya sopan.", emoji: "🛒", publishedAt: day(7) },
  { author: "Bayu Kusuma", city: "Jakarta", category: "Jasa", storeId: "store-4", rating: 5, body: "Cuci kiloan rapi, baju wangi, lipatannya rapi. Antar jemput on time. Sudah langganan 6 bulan, ngga pernah kecewa.", emoji: "🧺", publishedAt: day(10) },
  { author: "Linda Pertiwi", city: "Bandung", category: "Paket", storeId: "store-1", rating: 5, body: "Paket hemat paginya the best, hemat 8 ribu tiap pagi. Saya rutin tiap hari kerja mampir sebelum ke kantor. Recommended!", emoji: "🥐", publishedAt: day(12) },
  { author: "Rian Mahendra", city: "Surabaya", category: "Retail", storeId: "store-3", rating: 4, body: "Stoknya lengkap, harga kompetitif. Kadang antri agak panjang weekend pagi, tapi kasirnya cekatan. Overall recommended buat warga Rungkut.", emoji: "🌾", publishedAt: day(15) },
  { author: "Maya Sari", city: "Jakarta", category: "Jasa", storeId: "store-4", rating: 5, body: "Voucher 10 kg-nya hemat lumayan, lumayan fleksibel bisa dipakai bertahap. Apps tracking-nya kadang lemot tapi cs cepat tanggap.", emoji: "🎟️", publishedAt: day(18) },
  { author: "Adi Saputra", city: "Bandung", category: "Kuliner", storeId: "store-1", rating: 5, body: "Konsisten enak dari dulu. Bonusnya owner-nya friendly, sering ngobrol sama customer langsung. Rasa kekeluargaannya berasa.", emoji: "☕", publishedAt: day(20) },
  { author: "Rina Wati", city: "Bandung", category: "Kuliner", storeId: "store-2", rating: 4, body: "Outlet Braga vibes-nya heritage banget. Wi-Fi kenceng, cocok buat freelancer. Menu eksklusif Es Kopi Susu Braga wajib coba.", emoji: "🏪", publishedAt: day(22) },
  { author: "Tomi Hidayat", city: "Jakarta", category: "Jasa", storeId: "store-4", rating: 5, body: "Layanan express setrika rapi banget, baju kerja siap pakai. Selalu rekomen ke teman-teman kantor.", emoji: "👔", publishedAt: day(25) },
  { author: "Nur Aisyah", city: "Surabaya", category: "Paket", storeId: "store-3", rating: 5, body: "Katering rapatnya enak, packing rapi, on time. Kantor sering pesan sekarang, ngga pernah complain dari peserta meeting.", emoji: "🍱", publishedAt: day(28) },
  { author: "Galih Pradana", city: "Bandung", category: "Kuliner", storeId: "store-1", rating: 4, body: "Suka konsistensinya. Harga sedikit naik tapi worth it lah. Wi-Fi cepat, parkir lumayan luas. Cocok buat after-work meet up.", emoji: "☕", publishedAt: day(31) },
];

const PROMOTIONS = [
  { code: "HEMAT10", label: "Diskon 10% semua kuliner", kind: "percent" as const, value: 10, startAt: day(15), endAt: day(-15), usageLimit: 200, usedCount: 84, targetCategory: "Kuliner", status: "active" as const },
  { code: "PAGI8K", label: "Hemat Rp 8.000 paket sarapan", kind: "rupiah" as const, value: 8000, startAt: day(30), endAt: day(-30), usageLimit: 0, usedCount: 312, targetSku: "PAKET-PAGI", status: "active" as const },
  { code: "LAUNDRY15", label: "Diskon 15% laundry > 5 kg", kind: "percent" as const, value: 15, startAt: day(7), endAt: day(-20), usageLimit: 150, usedCount: 41, targetCategory: "Jasa", status: "active" as const },
  { code: "SEMBAKO20K", label: "Potongan Rp 20.000 sembako mingguan", kind: "rupiah" as const, value: 20000, startAt: day(3), endAt: day(-45), usageLimit: 100, usedCount: 18, targetSku: "SEMBAKO-W", status: "active" as const },
  { code: "RAMADAN25", label: "Promo Ramadan 25%", kind: "percent" as const, value: 25, startAt: day(-10), endAt: day(-40), usageLimit: 500, usedCount: 0, targetCategory: "Paket", status: "scheduled" as const },
  { code: "OPEN50", label: "Grand opening cabang Braga", kind: "percent" as const, value: 50, startAt: day(60), endAt: day(45), usageLimit: 100, usedCount: 100, targetCategory: "Kuliner", status: "expired" as const },
];

const SUPPLIERS = [
  { name: "CV Kopi Garut Mandiri", contactPerson: "Pak Asep", phone: "+62 812-7777-1111", city: "Garut", leadTimeDays: 3, terms: "Net 14", category: "Bahan baku", linkedSkus: ["KSG-01"], note: "Single-origin Garut. Order minimal 5 kg." },
  { name: "Cokelat Belgia Distribusi", contactPerson: "Sdri. Maya", phone: "+62 813-8888-2222", city: "Jakarta", leadTimeDays: 5, terms: "Net 7", category: "Bahan baku", linkedSkus: ["RBC-02"], note: "Cokelat premium import. PO Senin = kirim Jumat." },
  { name: "PT Tepung Sejahtera", contactPerson: "Bpk. Hartono", phone: "+62 821-9999-3333", city: "Surabaya", leadTimeDays: 2, terms: "COD", category: "Bahan baku", linkedSkus: ["TT-001"], note: "Distributor besar Surabaya. Diskon volume mulai 50 sak." },
  { name: "Laundry Supply Nusantara", contactPerson: "Mbak Yuni", phone: "+62 813-1010-4444", city: "Jakarta", leadTimeDays: 4, terms: "Net 14", category: "Bahan baku", linkedSkus: ["CSI-1"], note: "Detergen industri + softener + parfum laundry." },
  { name: "Karton Box Indo", contactPerson: "Pak Iwan", phone: "+62 812-2020-5555", city: "Bekasi", leadTimeDays: 7, terms: "Net 30", category: "Kemasan", linkedSkus: [], note: "Box packing custom. Minimum order 500 pcs per ukuran." },
  { name: "Ekspedisi Cepat Express", contactPerson: "Sdr. Bagas", phone: "+62 813-3030-6666", city: "Jakarta", leadTimeDays: 1, terms: "Cash", category: "Logistik", linkedSkus: [], note: "Same-day delivery Jabodetabek. Tarif kontrak korporat." },
  { name: "Frozen Food Surya", contactPerson: "Bu Sari", phone: "+62 821-4040-7777", city: "Surabaya", leadTimeDays: 2, terms: "Net 7", category: "Bahan baku", linkedSkus: [], note: "Daging, ayam, seafood frozen. Cold-chain delivery." },
];

// Keep in sync with components/templates/wirausaha/shared/seed.ts
// SEED_LANDING_SECTIONS. `syncLanding` below pushes additions/order to an
// already-seeded deployment without touching admin-edited copy.
// Item-bearing sections (stats/features/pricing/faq) seed their example content
// into `config` from convex/landingContent.ts — the SAME module the frontend
// render falls back to — so a fresh clone gets editable example data and there
// is no convex<->render drift. Table-backed kinds (portfolio/services/
// testimonials/blog) render from their own tables and carry no config here.
const LANDING = [
  { id: "ls-hero", order: 10, kind: "hero", title: HERO.title, subtitle: HERO.subtitle, enabled: true, config: JSON.stringify({ badge: HERO.badge }), layers: [{ id: "hero-photo", type: "image", placement: "background", opacity: 100, enabled: true, url: "/hero.webp" }, { id: "hero-overlay", type: "color", placement: "background", opacity: 30, enabled: true, color: "var(--primary)" }] },
  { id: "ls-stats", order: 15, kind: "stats", title: "Dipercaya pelaku usaha lokal", subtitle: "Angka berjalan dari semua unit yang dikelola lewat workspace ini.", enabled: true, config: JSON.stringify({ stats: STATS, clients: CLIENTS }) },
  { id: "ls-features", order: 20, kind: "features", title: "Operasi multi-unit, satu kontrol panel", subtitle: "Semua yang dibutuhkan wirausaha untuk kelola unit kuliner, retail, dan jasa.", enabled: true, config: JSON.stringify({ items: FEATURES }) },
  { id: "ls-portfolio", order: 30, kind: "portfolio", title: "Yang sudah jalan di Wirausaha OS", subtitle: "Sebagian unit usaha yang dikelola lewat workspace ini.", enabled: true },
  { id: "ls-services", order: 40, kind: "services", title: "Produk & jasa", subtitle: "Daftar produk multi-unit yang aktif tersedia.", enabled: true },
  { id: "ls-testimonials", order: 45, kind: "testimonials", title: "Apa kata pelanggan kami", subtitle: "Ulasan jujur dari pelanggan kuliner, retail, dan jasa.", enabled: true },
  { id: "ls-pricing", order: 50, kind: "pricing", title: "Cara belanja yang paling pas", subtitle: "Eceran, langganan rutin, sampai grosir — semua lewat satu toko.", enabled: true, config: JSON.stringify({ tiers: PRICING }) },
  { id: "ls-faq", order: 55, kind: "faq", title: "Pertanyaan yang sering masuk", subtitle: "Soal pesan antar, pembayaran, dan pelacakan pesanan.", enabled: true, config: JSON.stringify({ items: FAQS }) },
  { id: "ls-blog", order: 60, kind: "blog", title: "Promo & kabar terbaru", subtitle: "Menu baru, voucher, dan catatan dari dapur kami.", enabled: true },
  { id: "ls-cta", order: 65, kind: "cta", title: "Siap satukan operasi unit usaha?", subtitle: "Demo workspace dalam 5 menit.", enabled: true },
  { id: "ls-newsletter", order: 70, kind: "newsletter", title: "Dapat promo duluan", subtitle: "Voucher dan menu baru dikirim ke email, sebulan sekali. Tanpa spam.", enabled: true },
];

const PAGES = [
  { id: "sys-home", slug: "", title: "Home", description: "Landing — hero, fitur, unit usaha, produk, CTA.", blocks: [], status: "published", createdAt: day(180), updatedAt: day(180), systemPage: true, isLanding: true },
  { id: "sys-catalog", slug: "catalog", title: "Katalog", description: "Daftar produk & jasa publik.", blocks: [], status: "published", createdAt: day(180), updatedAt: day(180), systemPage: true },
  { id: "sys-stores", slug: "stores", title: "Outlet", description: "Lokasi outlet / store.", blocks: [], status: "published", createdAt: day(180), updatedAt: day(180), systemPage: true },
  { id: "sys-journal", slug: "journal", title: "Jurnal", description: "Promo, produk baru, liputan, tips.", blocks: [], status: "published", createdAt: day(180), updatedAt: day(180), systemPage: true },
  { id: "sys-testimoni", slug: "testimoni", title: "Testimoni", description: "Ulasan pelanggan.", blocks: [], status: "published", createdAt: day(180), updatedAt: day(180), systemPage: true },
  { id: "sys-services", slug: "services", title: "Services", description: "Produk & jasa multi-unit.", blocks: [], status: "published", createdAt: day(180), updatedAt: day(180), systemPage: true },
  { id: "sys-contact", slug: "contact", title: "Contact", description: "Hubungi kami.", blocks: [], status: "published", createdAt: day(180), updatedAt: day(180), systemPage: true },
];

// All demo content inserts (no wipe). Shared by `run`, `seedSample`, and
// `seedDemo`. Pass `{ landing: false }` to skip the landingSections inserts
// (used by `seedDemo`, which preserves admin-edited landing copy).
async function insertAll(ctx: any, opts: { landing?: boolean } = {}) {
  for (const b of BUSINESSES) await ctx.db.insert("wirausahaBusinesses", b);
  for (const p of PRODUCTS) await ctx.db.insert("wirausahaProducts", p);
  for (const c of CUSTOMERS) await ctx.db.insert("wirausahaCustomers", c);
  for (const o of ORDERS) await ctx.db.insert("wirausahaOrders", o);
  for (const f of FINANCE) await ctx.db.insert("wirausahaFinance", f);
  for (const s of STAFF) await ctx.db.insert("wirausahaStaff", s);
  for (const c of CATALOG) await ctx.db.insert("wirausahaCatalog", c);
  for (const s of STORES) await ctx.db.insert("wirausahaStores", s);
  for (const j of JOURNAL) await ctx.db.insert("wirausahaJournal", j);
  for (const r of REVIEWS) await ctx.db.insert("wirausahaReviews", r);
  for (const p of PROMOTIONS) await ctx.db.insert("wirausahaPromotions", p);
  for (const s of SUPPLIERS) await ctx.db.insert("wirausahaSuppliers", s);
  if (opts.landing !== false) for (const s of LANDING) await ctx.db.insert("landingSections", { sectionId: s.id, data: s });
  for (const p of PAGES) await ctx.db.insert("pages", { entryId: p.id, slug: p.slug, data: p });

  return {
    businesses: BUSINESSES.length,
    products: PRODUCTS.length,
    customers: CUSTOMERS.length,
    orders: ORDERS.length,
    finance: FINANCE.length,
    staff: STAFF.length,
    catalog: CATALOG.length,
    stores: STORES.length,
    journal: JOURNAL.length,
    reviews: REVIEWS.length,
    promotions: PROMOTIONS.length,
    suppliers: SUPPLIERS.length,
    landing: LANDING.length,
    pages: PAGES.length,
  };
}

const CONTENT_TABLES = [
  "wirausahaBusinesses",
  "wirausahaProducts",
  "wirausahaOrders",
  "wirausahaCustomers",
  "wirausahaFinance",
  "wirausahaStaff",
  "wirausahaCatalog",
  "wirausahaStores",
  "wirausahaJournal",
  "wirausahaReviews",
  "wirausahaPromotions",
  "wirausahaSuppliers",
  "landingSections",
  "pages",
] as const;

// Power/CLI seed: wipes content tables first, then inserts. Destructive — only
// for terminal use where you explicitly want a reset.
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    for (const t of CONTENT_TABLES) {
      for (const row of await ctx.db.query(t).take(1000)) await ctx.db.delete(row._id);
    }
    return insertAll(ctx);
  },
});

// Demo/CLI seed (NO auth, internal — run via `npx convex run seed:seedDemo`).
// For SHOWCASE/demo deployments only. Refills the content tables for a full
// demo and ensures the hero landing image, WITHOUT wiping admin-edited landing
// copy. Idempotent.
export const seedDemo = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const t of CONTENT_TABLES) {
      if (t === "landingSections") continue;
      for (const row of await ctx.db.query(t).take(1000)) await ctx.db.delete(row._id);
    }
    const counts = await insertAll(ctx, { landing: false });
    // Seed landing only if the table is empty (preserve admin-edited copy).
    const hasLanding = await ctx.db.query("landingSections").first();
    if (!hasLanding) {
      for (const s of LANDING) await ctx.db.insert("landingSections", { sectionId: s.id, data: s });
    }
    return counts;
  },
});

// Additive landing sync for already-seeded deployments: inserts LANDING
// entries whose sectionId is missing and aligns `order` to the canonical
// lineup. Never touches admin-edited copy/enabled/config on existing rows.
export const syncLanding = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    let inserted = 0;
    let reordered = 0;
    for (const s of LANDING) {
      const existing = await ctx.db
        .query("landingSections")
        .withIndex("by_sectionId", (q) => q.eq("sectionId", s.id))
        .unique();
      if (!existing) {
        await ctx.db.insert("landingSections", { sectionId: s.id, data: s });
        inserted++;
      } else if ((existing.data as { order?: number }).order !== s.order) {
        await ctx.db.patch(existing._id, {
          data: { ...(existing.data as Record<string, unknown>), order: s.order },
        });
        reordered++;
      }
    }
    return { inserted, reordered };
  },
});

// Additive image sync for already-seeded catalogs: sets `image` on existing
// wirausahaCatalog rows (matched by slug) from the seed lineup. Only fills when
// the row has no image yet — never overwrites an owner-set photo.
export const syncCatalogImages = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    let patched = 0;
    for (const c of CATALOG) {
      if (!c.image) continue;
      const existing = await ctx.db
        .query("wirausahaCatalog")
        .withIndex("by_slug", (q) => q.eq("slug", c.slug))
        .first();
      if (existing && !existing.image) {
        await ctx.db.patch(existing._id, { image: c.image });
        patched++;
      }
    }
    return { patched };
  },
});

// In-app one-click seed for non-technical owners. Safe: requires an authenticated
// admin AND only runs on an empty site, so it can never wipe real content.
export const seedSample = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Harus login sebagai admin.");
    const hasBusiness = await ctx.db.query("wirausahaBusinesses").first();
    const hasLanding = await ctx.db.query("landingSections").first();
    if (hasBusiness || hasLanding) {
      return { seeded: false, reason: "already-has-content" as const };
    }
    const counts = await insertAll(ctx);
    return { seeded: true, ...counts };
  },
});
