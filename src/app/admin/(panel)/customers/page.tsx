import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";
import CustomersTable, { type AdminCustomerRow } from "@/components/admin/CustomersTable";
import { PageHeader, StatCard } from "@/components/admin/ui/kit";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  const users = await prisma.user.findMany({
    include: { orders: { select: { total: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminCustomerRow[] = users.map((u) => {
    const spent = u.orders
      .filter((o) => ["PAID", "SHIPPED", "DONE"].includes(o.status))
      .reduce((n, o) => n + o.total, 0);
    return { id: u.id, name: u.name, email: u.email, orders: u.orders.length, spent, joined: u.createdAt.toISOString() };
  });

  const totalSpent = rows.reduce((n, r) => n + r.spent, 0);
  const stats = [
    { label: "Total pelanggan", value: String(users.length), icon: "👥" },
    { label: "Total belanja", value: rupiah(totalSpent), icon: "💰", accent: true },
  ];

  return (
    <div>
      <PageHeader title="Pelanggan" subtitle="Daftar pelanggan terdaftar dan riwayat belanja." />
      <div className="mb-6 grid grid-cols-2 gap-3">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <CustomersTable customers={rows} />
    </div>
  );
}
