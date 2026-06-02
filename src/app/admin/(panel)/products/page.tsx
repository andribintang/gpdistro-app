import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { totalStock } from "@/lib/types";
import ProductsTable, { type AdminProductRow } from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    include: { category: true, sizes: true, images: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    image: p.images.slice().sort((a, b) => a.order - b.order)[0]?.url ?? null,
    emoji: p.emoji,
    basePrice: p.basePrice,
    oldPrice: p.oldPrice,
    stock: totalStock(p.sizes.map((s) => ({ label: s.label, stock: s.stock }))),
    sizes: p.sizes.slice().sort((a, b) => a.order - b.order).map((s) => s.label),
    active: p.isActive,
    bestSeller: p.isBestSeller,
    isNew: p.isNew,
  }));

  const categories = [...new Set(rows.map((r) => r.category))];
  const activeCount = rows.filter((r) => r.active).length;
  const lowStock = rows.filter((r) => r.stock <= 5).length;

  const stats = [
    ["Total produk", String(products.length)],
    ["Aktif", String(activeCount)],
    ["Stok menipis", String(lowStock)],
    ["Kategori", String(categories.length)],
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="disp text-3xl text-bone">Produk</h1>
          <p className="mt-1 text-sm text-muted">Kelola katalog, stok, dan foto produk.</p>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-volt px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">+ Produk Baru</Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([label, val]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-[11.5px] uppercase tracking-wide text-muted">{label}</div>
            <div className="disp mt-1 text-2xl text-bone">{val}</div>
          </div>
        ))}
      </div>

      <ProductsTable products={rows} categories={categories} />
    </div>
  );
}
