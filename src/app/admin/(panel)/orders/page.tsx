import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";
import OrdersTable, { type AdminOrderRow } from "@/components/admin/OrdersTable";
import { PageHeader, StatCard } from "@/components/admin/ui/kit";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminOrderRow[] = orders.map((o) => ({
    id: o.id,
    customer: o.customerName,
    email: o.email,
    phone: o.phone,
    createdAt: o.createdAt.toISOString(),
    itemsCount: o.items.length,
    itemsSummary: o.items.map((it) => `${it.name} (${it.size})`).join(", "),
    total: o.total,
    status: o.status,
  }));

  const revenue = orders.filter((o) => ["PAID", "SHIPPED", "DONE"].includes(o.status)).reduce((n, o) => n + o.total, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;

  const stats = [
    { label: "Total pesanan", value: String(orders.length), icon: "🧾" },
    { label: "Perlu diproses", value: String(pending), icon: "⏳", accent: true },
    { label: "Omzet (dibayar)", value: rupiah(revenue), icon: "💰" },
  ];

  return (
    <div>
      <PageHeader title="Pesanan" subtitle="Kelola dan perbarui status pesanan masuk." />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <OrdersTable orders={rows} />
    </div>
  );
}
