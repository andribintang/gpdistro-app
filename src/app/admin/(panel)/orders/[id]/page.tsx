import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";
import { confirmPayment, shipOrder, completeOrder, cancelOrder } from "@/app/admin/actions";
import { SectionCard, Badge, inputCls } from "@/components/admin/ui/kit";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = { PENDING: "amber", PAID: "green", SHIPPED: "volt", DONE: "green", CANCELLED: "red" };
const STATUS_LABEL: Record<string, string> = { PENDING: "Menunggu Pembayaran", PAID: "Sudah Dibayar", SHIPPED: "Dikirim", DONE: "Selesai", CANCELLED: "Dibatalkan" };

const fmt = (d: Date | null) => (d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—");

export default async function ManageOrder({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) notFound();

  const subtotal = order.total - order.shippingCost;
  const tone = (STATUS_TONE[order.status] ?? "gray") as any;

  return (
    <div className="grid max-w-4xl gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/orders" className="text-[12px] font-bold uppercase tracking-wide text-volt">← Semua pesanan</Link>
        <Badge tone={tone} dot>{STATUS_LABEL[order.status] ?? order.status}</Badge>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="font-mono text-[12px] text-muted">#{order.id}</div>
          <h1 className="disp text-2xl text-bone">{order.customerName}</h1>
        </div>
        <div className="text-right text-[12.5px] text-muted">
          <div>Dibuat: {fmt(order.createdAt)}</div>
          {order.paidAt && <div>Dibayar: {fmt(order.paidAt)}</div>}
          {order.shippedAt && <div>Dikirim: {fmt(order.shippedAt)}</div>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* kiri: item + ringkasan */}
        <div className="grid gap-5">
          <SectionCard title="Item Pesanan">
            <div className="grid gap-2">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between rounded-xl bg-bg px-3 py-2.5 text-sm">
                  <span className="text-bone">{it.name} <span className="text-muted">· {it.size} · {it.quantity}×</span></span>
                  <span className="text-muted">{rupiah(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span>{rupiah(subtotal)}</span></div>
              <div className="flex justify-between text-muted">
                <span>Ongkir {order.shippingCourier ? `· ${order.shippingCourier} ${order.shippingService ?? ""}` : ""}</span>
                <span>{rupiah(order.shippingCost)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-line pt-2">
                <span className="font-bold text-bone">Total</span>
                <span className="disp text-xl text-volt">{rupiah(order.total)}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Pengiriman ke">
            <div className="text-sm text-bone">{order.customerName} · {order.phone}</div>
            <div className="text-[13px] text-muted">{order.email}</div>
            <div className="mt-1 text-[13px] text-muted">{order.address}</div>
            {order.trackingNumber && (
              <div className="mt-3 rounded-xl bg-bg p-3 text-sm">
                No. Resi: <span className="font-mono font-bold text-bone">{order.trackingNumber}</span>
              </div>
            )}
          </SectionCard>
        </div>

        {/* kanan: aksi sesuai status */}
        <div className="grid h-fit gap-5">
          <SectionCard title="Proses Pesanan">
            {order.status === "PENDING" && (
              <div className="grid gap-3">
                <p className="text-[13px] text-muted">Konfirmasi setelah pembayaran pelanggan diterima.</p>
                <form action={confirmPayment.bind(null, order.id)}>
                  <button className="w-full rounded-full bg-volt py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">✓ Terima Pembayaran</button>
                </form>
              </div>
            )}

            {order.status === "PAID" && (
              <form action={shipOrder.bind(null, order.id)} className="grid gap-3">
                <p className="text-[13px] text-muted">Masukkan nomor resi lalu tandai dikirim.</p>
                <input name="trackingNumber" required placeholder="No. resi pengiriman" className={inputCls} />
                <button className="w-full rounded-full bg-volt py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">🚚 Kirim & Simpan Resi</button>
              </form>
            )}

            {order.status === "SHIPPED" && (
              <div className="grid gap-3">
                <p className="text-[13px] text-muted">Barang sudah dikirim. Tandai selesai bila pesanan diterima pelanggan.</p>
                <form action={completeOrder.bind(null, order.id)}>
                  <button className="w-full rounded-full bg-volt py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">✓ Tandai Selesai</button>
                </form>
              </div>
            )}

            {(order.status === "DONE" || order.status === "CANCELLED") && (
              <p className="text-sm text-muted">Pesanan sudah {STATUS_LABEL[order.status]?.toLowerCase()}. Tidak ada aksi lanjutan.</p>
            )}

            {order.status !== "DONE" && order.status !== "CANCELLED" && (
              <form action={cancelOrder.bind(null, order.id)} className="mt-3 border-t border-line pt-3">
                <button className="w-full rounded-full border border-line py-2.5 text-[13px] font-bold uppercase tracking-wide text-muted transition hover:border-red-500 hover:text-red-500">Batalkan pesanan</button>
              </form>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
