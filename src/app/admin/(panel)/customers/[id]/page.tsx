import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Bayar", PAID: "Dibayar", SHIPPED: "Dikirim", DONE: "Selesai", CANCELLED: "Batal",
};

export default async function CustomerDetail({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      orders: { include: { items: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) notFound();

  const spent = user.orders
    .filter((o) => ["PAID", "SHIPPED", "DONE"].includes(o.status))
    .reduce((n, o) => n + o.total, 0);

  return (
    <div>
      <Link href="/admin/customers" className="text-[12px] font-bold uppercase tracking-wide text-volt">← Pelanggan</Link>
      <h1 className="disp mb-1 mt-2 text-3xl text-bone">{user.name}</h1>
      <p className="mb-6 text-sm text-muted">{user.email} · bergabung {new Date(user.createdAt).toLocaleDateString("id-ID")}</p>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[["Total pesanan", String(user.orders.length)], ["Total belanja", rupiah(spent)], ["Alamat tersimpan", String(user.addresses.length)]].map(([l, v]) => (
          <div key={l} className="rounded-xl2 border border-line bg-surface p-5">
            <div className="text-[12px] uppercase tracking-wide text-muted">{l}</div>
            <div className="disp mt-1 text-2xl text-bone">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl2 border border-line bg-surface p-5">
          <h2 className="mb-4 font-extrabold uppercase tracking-wide text-bone">Alamat</h2>
          {user.addresses.length === 0 ? (
            <p className="text-sm text-muted">Belum ada alamat tersimpan.</p>
          ) : (
            <div className="grid gap-3">
              {user.addresses.map((a) => (
                <div key={a.id} className="rounded-lg bg-bg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-bone">{a.label}</span>
                    {a.isDefault && <span className="rounded-full bg-volt/15 px-2 py-0.5 text-[10px] font-bold text-volt">Utama</span>}
                  </div>
                  <div className="text-bone">{a.recipient} · {a.phone}</div>
                  <div className="text-[13px] text-muted">{a.address}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl2 border border-line bg-surface p-5">
          <h2 className="mb-4 font-extrabold uppercase tracking-wide text-bone">Riwayat Pesanan</h2>
          {user.orders.length === 0 ? (
            <p className="text-sm text-muted">Belum ada pesanan.</p>
          ) : (
            <div className="grid gap-2">
              {user.orders.map((o) => (
                <Link key={o.id} href={`/order/${o.id}`} className="block rounded-lg bg-bg p-3 text-sm hover:opacity-80">
                  <div className="flex justify-between">
                    <span className="text-bone">{o.items.length} item</span>
                    <span className="font-bold text-bone">{rupiah(o.total)}</span>
                  </div>
                  <div className="mt-0.5 flex justify-between text-[12px] text-muted">
                    <span>{new Date(o.createdAt).toLocaleDateString("id-ID")}</span>
                    <span>{STATUS_LABEL[o.status] ?? o.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
