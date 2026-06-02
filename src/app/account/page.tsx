import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-customer";
import { logoutUser, addAddress, deleteAddress, setDefaultAddress } from "./actions";
import AddressForm from "@/components/AddressForm";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Bayar", PAID: "Dibayar", SHIPPED: "Dikirim", DONE: "Selesai", CANCELLED: "Batal",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");

  const [orders, addresses] = await Promise.all([
    prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
  ]);

  return (
    <div className="mx-auto max-w-[900px] px-5 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="disp text-3xl text-bone">Halo, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        <form action={logoutUser}>
          <button className="rounded-full border border-line px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide text-bone hover:border-volt hover:text-volt">Keluar</button>
        </form>
      </div>

      {/* ALAMAT */}
      <section className="mb-10">
        <h2 className="disp mb-4 text-2xl text-bone">Alamat Saya</h2>

        {addresses.length > 0 && (
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className={`rounded-xl2 border bg-surface p-4 ${a.isDefault ? "border-volt" : "border-line"}`}>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-bold text-bone">{a.label}</span>
                  {a.isDefault && <span className="rounded-full bg-volt/15 px-2 py-0.5 text-[10.5px] font-bold text-volt">Utama</span>}
                </div>
                <div className="text-sm text-bone">{a.recipient} · {a.phone}</div>
                <div className="text-[13px] text-muted">{a.address}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/account/addresses/${a.id}`} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-bone hover:border-volt hover:text-volt">Edit</Link>
                  {!a.isDefault && (
                    <form action={setDefaultAddress.bind(null, a.id)}>
                      <button className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-muted hover:border-volt hover:text-volt">Jadikan utama</button>
                    </form>
                  )}
                  <form action={deleteAddress.bind(null, a.id)}>
                    <button className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-muted hover:border-volt hover:text-volt">Hapus</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl2 border border-line bg-surface p-5">
          <h3 className="mb-3 font-bold uppercase tracking-wide text-bone">Tambah Alamat</h3>
          <AddressForm action={addAddress} submitLabel="Simpan Alamat" compact />
        </div>
      </section>

      {/* PESANAN */}
      <h2 className="disp mb-4 text-2xl text-bone">Pesanan Saya</h2>
      {orders.length === 0 ? (
        <div className="rounded-xl2 border border-line bg-surface py-16 text-center text-muted">
          Belum ada pesanan. <Link href="/products" className="font-bold text-volt">Mulai belanja →</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <Link key={o.id} href={`/order/${o.id}`} className="block rounded-xl2 border border-line bg-surface p-5 transition hover:border-volt/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-[11px] text-muted">#{o.id}</div>
                  <div className="mt-0.5 text-sm text-bone">{o.items.length} item · {new Date(o.createdAt).toLocaleDateString("id-ID")}</div>
                  <div className="mt-1 text-[13px] text-muted">{o.items.map((it) => `${it.name} (${it.size})`).join(", ")}</div>
                </div>
                <div className="text-right">
                  <div className="disp text-lg text-volt">{rupiah(o.total)}</div>
                  <span className="mt-1 inline-block rounded-full bg-surface2 px-2.5 py-0.5 text-[11px] font-bold text-bone">{STATUS_LABEL[o.status] ?? o.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
