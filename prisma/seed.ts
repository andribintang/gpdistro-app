import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Kaos", slug: "kaos", emoji: "👕" },
  { name: "Kemeja", slug: "kemeja", emoji: "👔" },
  { name: "Hoodie & Jaket", slug: "hoodie-jaket", emoji: "🧥" },
  { name: "Celana", slug: "celana", emoji: "👖" },
  { name: "Topi & Aksesoris", slug: "aksesoris", emoji: "🧢" },
];

type Seed = {
  slug: string; name: string; category: string;
  basePrice: number; oldPrice?: number; emoji: string;
  material: string; fit: string;
  best?: boolean; isNew?: boolean; desc: string;
  sizes: { label: string; stock: number }[];
};

const APP = (s: number) => [
  { label: "S", stock: s }, { label: "M", stock: s + 4 },
  { label: "L", stock: s + 3 }, { label: "XL", stock: s },
];
const WAIST = (s: number) => [
  { label: "28", stock: s }, { label: "30", stock: s + 2 },
  { label: "32", stock: s + 2 }, { label: "34", stock: s },
];
const ONE = (s: number) => [{ label: "All Size", stock: s }];

const products: Seed[] = [
  // KAOS
  { slug: "tee-concrete", name: "Oversized Tee 'Concrete'", category: "kaos",
    basePrice: 149000, oldPrice: 199000, emoji: "👕", material: "Cotton Combed 24s", fit: "Oversized",
    best: true, isNew: true, desc: "Kaos oversized dengan grafis bold di punggung. Jahitan rapi, sablon plastisol tahan lama.", sizes: APP(6) },
  { slug: "tee-static", name: "Boxy Tee 'Static'", category: "kaos",
    basePrice: 139000, oldPrice: 179000, emoji: "👕", material: "Cotton Combed 30s", fit: "Boxy",
    best: true, desc: "Potongan boxy yang clean, bahan adem. Cocok buat daily streetwear.", sizes: APP(5) },
  { slug: "tee-nightshift", name: "Tee 'Nightshift' Black", category: "kaos",
    basePrice: 145000, emoji: "👕", material: "Cotton Combed 24s", fit: "Regular",
    isNew: true, desc: "Hitam pekat dengan bordir logo minimalis di dada.", sizes: APP(4) },
  { slug: "tee-grid-white", name: "Tee 'Grid' Off-White", category: "kaos",
    basePrice: 135000, oldPrice: 169000, emoji: "👕", material: "Cotton Combed 30s", fit: "Regular",
    desc: "Warna off-white netral, gampang dipadupadankan.", sizes: APP(5) },

  // KEMEJA
  { slug: "flannel-grid", name: "Flannel Shirt 'Grid'", category: "kemeja",
    basePrice: 249000, oldPrice: 320000, emoji: "👔", material: "Flanel Cotton", fit: "Regular",
    best: true, desc: "Kemeja flanel motif kotak, bahan tebal dan hangat. Bisa dipakai layering.", sizes: APP(4) },
  { slug: "workshirt-utility", name: "Workshirt 'Utility'", category: "kemeja",
    basePrice: 269000, emoji: "👔", material: "Twill Cotton", fit: "Boxy",
    isNew: true, desc: "Kemeja kerja gaya workwear dengan dua kantong depan dan kancing metal.", sizes: APP(3) },
  { slug: "shirt-shadow-stripe", name: "Shirt 'Shadow Stripe'", category: "kemeja",
    basePrice: 229000, oldPrice: 279000, emoji: "👔", material: "Rayon", fit: "Regular",
    desc: "Kemeja lengan pendek motif garis tipis, jatuh dan ringan.", sizes: APP(4) },

  // HOODIE & JAKET
  { slug: "hoodie-shadow", name: "Hoodie 'Shadow'", category: "hoodie-jaket",
    basePrice: 329000, oldPrice: 399000, emoji: "🧥", material: "Fleece CVC 280gsm", fit: "Oversized",
    best: true, isNew: true, desc: "Hoodie oversized bahan fleece tebal, kangaroo pocket, tali hood metal tip.", sizes: APP(5) },
  { slug: "coach-jacket-patrol", name: "Coach Jacket 'Patrol'", category: "hoodie-jaket",
    basePrice: 359000, emoji: "🧥", material: "Taslan Waterproof", fit: "Regular",
    best: true, desc: "Coach jacket anti air dengan kancing snap. Ringan tapi tahan angin.", sizes: APP(3) },
  { slug: "varsity-district", name: "Varsity Jacket 'District'", category: "hoodie-jaket",
    basePrice: 449000, oldPrice: 549000, emoji: "🧥", material: "Fleece + Kulit Sintetis", fit: "Regular",
    desc: "Jaket varsity klasik, bordir chenille di dada, rib knit di lengan.", sizes: APP(2) },

  // CELANA
  { slug: "cargo-sektor", name: "Cargo Pants 'Sektor'", category: "celana",
    basePrice: 289000, emoji: "👖", material: "Ripstop Cotton", fit: "Loose",
    best: true, isNew: true, desc: "Celana cargo dengan banyak kantong fungsional. Bahan ripstop kuat.", sizes: WAIST(4) },
  { slug: "baggy-denim-faded", name: "Baggy Denim 'Faded'", category: "celana",
    basePrice: 319000, oldPrice: 379000, emoji: "👖", material: "Denim 12oz", fit: "Baggy",
    desc: "Jeans baggy washing faded, siluet lebar khas streetwear.", sizes: WAIST(3) },
  { slug: "track-pants-velocity", name: "Track Pants 'Velocity'", category: "celana",
    basePrice: 219000, emoji: "👖", material: "Polyester Diadora", fit: "Tapered",
    desc: "Track pants dengan list samping, karet pinggang nyaman.", sizes: APP(4) },

  // TOPI & AKSESORIS
  { slug: "dad-hat-emblem", name: "Dad Hat 'Emblem'", category: "aksesoris",
    basePrice: 99000, emoji: "🧢", material: "Cotton Drill", fit: "Adjustable",
    best: true, desc: "Topi dad hat bordir logo, strap belakang adjustable.", sizes: ONE(20) },
  { slug: "beanie-frost", name: "Beanie 'Frost'", category: "aksesoris",
    basePrice: 89000, emoji: "🧢", material: "Acrylic Knit", fit: "Adjustable",
    isNew: true, desc: "Kupluk rajut hangat dengan label woven.", sizes: ONE(15) },
  { slug: "tote-carrier", name: "Tote Bag 'Carrier'", category: "aksesoris",
    basePrice: 79000, emoji: "🧢", material: "Canvas 14oz", fit: "One Size",
    desc: "Tote bag kanvas tebal, muat banyak, sablon grafis.", sizes: ONE(0) }, // contoh stok habis
  { slug: "snapback-crest", name: "Snapback 'Crest'", category: "aksesoris",
    basePrice: 119000, oldPrice: 149000, emoji: "🧢", material: "Cotton Twill", fit: "Adjustable",
    desc: "Snapback flat brim, bordir 3D di depan.", sizes: ONE(12) },
];

async function main() {
  console.log("🌱 Seeding GPDISTRO...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // tema default
  await prisma.setting.upsert({
    where: { key: "theme" },
    create: { key: "theme", value: "streetwear" },
    update: {},
  });

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    catMap[c.slug] = created.id;
  }

  for (const p of products) {
    await prisma.product.create({
      data: {
        slug: p.slug, name: p.name, description: p.desc, emoji: p.emoji,
        basePrice: p.basePrice, oldPrice: p.oldPrice ?? null,
        material: p.material, fit: p.fit,
        isBestSeller: p.best ?? false, isNew: p.isNew ?? false,
        categoryId: catMap[p.category],
        sizes: { create: p.sizes.map((s, i) => ({ label: s.label, stock: s.stock, order: i })) },
      },
    });
  }

  await prisma.setting.upsert({
    where: { key: "theme" },
    update: {},
    create: { key: "theme", value: "streetwear" },
  });

  console.log(`✅ ${categories.length} kategori, ${products.length} produk dengan varian ukuran.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
