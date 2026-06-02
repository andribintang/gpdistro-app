import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [productCount, orderCount, pendingCount, orders, lowStock, recent] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({ select: { total: true } }),
    prisma.productSize.findMany({
      where: { stock: { lte: 3 } },
      include: { product: true },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const revenue = orders.reduce((n, o) => n + o.total, 0);

  const stats = [
    ["Produk aktif", String(productCount)],
    ["Total pesanan", String(orderCount)],
    ["Perlu diproses", String(pendingCount)],
    ["Estimasi omzet", rupiah(revenue)],
  ];

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <h1 className="disp text-3xl text-bone">Dashboard</h1>
        <Link href="/admin/products/new" className="rounded-full bg-volt px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-bg hover:bg-volt-dark">+ Produk Baru</Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, val]) => (
          <div key={label} className="rounded-xl2 border border-line bg-surface p-5">
            <div className="text-[12px] uppercase tracking-wide text-muted">{label}</div>
            <div className="disp mt-1 text-2xl text-bone">{val}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* low stock */}
        <div className="rounded-xl2 border border-line bg-surface p-5">
          <h2 className="mb-4 font-extrabold uppercase tracking-wide text-bone">Stok menipis ≤ 3</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">Semua stok aman 👍</p>
          ) : (
            <div className="grid gap-2">
              {lowStock.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-sm">
                  <span className="truncate text-bone">{s.product.name} <span className="text-muted">· {s.label}</span></span>
                  <span className={`font-bold ${s.stock === 0 ? "text-volt" : "text-bone"}`}>{s.stock}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* recent orders */}
        <div className="rounded-xl2 border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold uppercase tracking-wide text-bone">Pesanan terbaru</h2>
            <Link href="/admin/orders" className="text-[12px] font-bold uppercase text-volt">Semua →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Belum ada pesanan.</p>
          ) : (
            <div className="grid gap-2">
              {recent.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-sm">
                  <span className="truncate text-bone">{o.customerName}</span>
                  <span className="text-muted">{rupiah(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
