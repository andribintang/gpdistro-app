import { prisma } from "@/lib/prisma";
import { totalStock } from "@/lib/types";
import ProductsTable, { type AdminProductRow } from "@/components/admin/ProductsTable";
import ImportProducts from "@/components/admin/ImportProducts";
import { PageHeader, PrimaryLink, StatCard } from "@/components/admin/ui/kit";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const [products, cats] = await Promise.all([
    prisma.product.findMany({ include: { category: true, sizes: true, images: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows: AdminProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    image: p.images.slice().sort((a, b) => a.order - b.order)[0]?.url ?? null,
    emoji: p.emoji,
    basePrice: p.basePrice,
    costPrice: p.costPrice,
    oldPrice: p.oldPrice,
    stock: totalStock(p.sizes.map((s) => ({ label: s.label, stock: s.stock }))),
    sizes: p.sizes.slice().sort((a, b) => a.order - b.order).map((s) => s.label),
    active: p.isActive,
    bestSeller: p.isBestSeller,
    isNew: p.isNew,
  }));

  const categories = cats.map((c) => ({ id: c.id, name: c.name }));
  const stats = [
    { label: "Total produk", value: String(products.length), icon: "📦" },
    { label: "Aktif", value: String(rows.filter((r) => r.active).length), icon: "✅", accent: true },
    { label: "Stok menipis", value: String(rows.filter((r) => r.stock <= 5).length), icon: "⚠️" },
    { label: "Kategori", value: String(categories.length), icon: "🏷️" },
  ];

  return (
    <div>
      <PageHeader title="Produk" subtitle="Kelola katalog, stok, dan foto produk."
        action={<PrimaryLink href="/admin/products/new">+ Produk Baru</PrimaryLink>} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="mb-6"><ImportProducts /></div>

      <ProductsTable products={rows} categories={categories} />
    </div>
  );
}
