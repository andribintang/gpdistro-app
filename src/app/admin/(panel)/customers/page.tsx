import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  const users = await prisma.user.findMany({
    include: {
      orders: { select: { total: true, status: true } },
      _count: { select: { addresses: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = users.map((u) => {
    const paid = u.orders.filter((o) => o.status === "PAID" || o.status === "SHIPPED" || o.status === "DONE");
    const spent = paid.reduce((n, o) => n + o.total, 0);
    return { ...u, spent };
  });

  return (
    <div>
      <h1 className="disp mb-7 text-3xl text-bone">Pelanggan <span className="text-muted">({users.length})</span></h1>

      {users.length === 0 ? (
        <div className="rounded-xl2 border border-line bg-surface py-20 text-center text-muted">Belum ada pelanggan terdaftar.</div>
      ) : (
        <div className="overflow-hidden rounded-xl2 border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface2 text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Pesanan</th>
                <th className="px-4 py-3">Total belanja</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-line bg-surface">
                  <td className="px-4 py-3 font-bold text-bone">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3 text-bone">{u._count.orders}</td>
                  <td className="px-4 py-3 font-bold text-bone">{rupiah(u.spent)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/customers/${u.id}`} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-bone hover:border-volt hover:text-volt">Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
