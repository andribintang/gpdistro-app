import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";
import PayButton from "@/components/PayButton";

export const dynamic = "force-dynamic";

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
const SNAP_SRC =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

const VIEW: Record<string, { icon: string; title: string; note: string; color: string }> = {
  PAID: { icon: "✅", title: "Pembayaran Berhasil", note: "Terima kasih! Pesananmu sedang kami siapkan dan akan segera dikirim.", color: "text-volt" },
  PENDING: { icon: "⏳", title: "Menunggu Pembayaran", note: "Selesaikan pembayaran untuk memproses pesananmu.", color: "text-bone" },
  SHIPPED: { icon: "🚚", title: "Pesanan Dikirim", note: "Pesananmu sedang dalam perjalanan.", color: "text-volt" },
  DONE: { icon: "🎉", title: "Pesanan Selesai", note: "Selesai! Terima kasih sudah belanja di GPDISTRO.", color: "text-volt" },
  CANCELLED: { icon: "✖️", title: "Pembayaran Dibatalkan", note: "Transaksi tidak selesai atau dibatalkan. Kamu bisa pesan lagi kapan saja.", color: "text-muted" },
};

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) notFound();

  const v = VIEW[order.status] ?? VIEW.PENDING;

  return (
    <div className="mx-auto max-w-[680px] px-5 py-12">
      <Script src={SNAP_SRC} data-client-key={CLIENT_KEY} strategy="afterInteractive" />

      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mb-3 text-6xl">{v.icon}</div>
        <h1 className={`disp text-3xl ${v.color}`}>{v.title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{v.note}</p>
        <p className="mt-3 font-mono text-[12px] text-muted">Order #{order.id}</p>

        {order.status === "PENDING" && (
          <div className="mt-6 flex justify-center">
            <PayButton orderId={order.id} />
          </div>
        )}

        {order.trackingNumber && (
          <div className="mx-auto mt-5 inline-block rounded-xl border border-line bg-surface px-4 py-2.5 text-sm">
            No. Resi: <span className="font-mono font-bold text-bone">{order.trackingNumber}</span>
            {order.shippingCourier && <span className="text-muted"> · {order.shippingCourier}</span>}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-4 font-extrabold uppercase tracking-wide text-bone">Detail Pesanan</h2>
        <div className="grid gap-2">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-bone">{it.name} <span className="text-muted">· {it.size} · {it.quantity}×</span></span>
              <span className="text-muted">{rupiah(it.price * it.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between text-muted"><span>Subtotal</span><span>{rupiah(order.total - order.shippingCost)}</span></div>
          <div className="flex justify-between text-muted">
            <span>Ongkir {order.shippingCourier ? `(${order.shippingCourier} ${order.shippingService ?? ""})` : ""}</span>
            <span>{rupiah(order.shippingCost)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-line pt-2">
            <span className="font-bold text-bone">Total</span>
            <span className="disp text-xl text-volt">{rupiah(order.total)}</span>
          </div>
        </div>
        <div className="mt-4 text-[13px] text-muted">
          <div>{order.customerName} · {order.phone}</div>
          <div>{order.address}</div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/products" className="text-[13px] font-bold uppercase tracking-wide text-volt">← Lanjut Belanja</Link>
      </div>
    </div>
  );
}
