import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";
import { PageHeader, PrimaryLink, StatCard, SectionCard, Badge } from "@/components/admin/ui/kit";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  PENDING: "amber", PAID: "green", SHIPPED: "volt", DONE: "green", CANCELLED: "red",
};

export default async function Dashboard() {
  const [productCount, orderCount, pendingCount, orders, lowStock, recent] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({ select: { total: true, status: true } }),
    prisma.productSize.findMany({ where: { stock: { lte: 5 } }, include: { product: true }, orderBy: { stock: "asc" }, take: 8 }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const revenue = orders.filter((o) => ["PAID", "SHIPPED", "DONE"].includes(o.status)).reduce((n, o) => n + o.total, 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ringkasan toko GPDISTRO."
        action={<PrimaryLink href="/admin/products/new">+ Produk Baru</PrimaryLink>} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Produk aktif" value={String(productCount)} icon="📦" />
        <StatCard label="Total pesanan" value={String(orderCount)} icon="🧾" />
        <StatCard label="Perlu diproses" value={String(pendingCount)} icon="⏳" accent />
        <StatCard label="Omzet (dibayar)" value={rupiah(revenue)} icon="💰" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Stok menipis ≤ 5">
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">Semua stok aman 👍</p>
          ) : (
            <div className="grid gap-2">
              {lowStock.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-bg px-3 py-2.5 text-sm">
                  <span className="truncate text-bone">{s.product.name} <span className="text-muted">· {s.label}</span></span>
                  <Badge tone={(s.stock === 0 ? "red" : "amber") as any} dot>{s.stock}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Pesanan terbaru">
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Belum ada pesanan.</p>
          ) : (
            <div className="grid gap-2">
              {recent.map((o) => (
                <Link key={o.id} href="/admin/orders" className="flex items-center justify-between rounded-xl bg-bg px-3 py-2.5 text-sm transition hover:opacity-80">
                  <span className="truncate text-bone">{o.customerName}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-muted">{rupiah(o.total)}</span>
                    <Badge tone={(STATUS_TONE[o.status] ?? "gray") as any}>{o.status}</Badge>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
