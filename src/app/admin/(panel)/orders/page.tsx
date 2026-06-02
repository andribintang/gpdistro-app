import { prisma } from "@/lib/prisma";
import { rupiah } from "@/lib/format";
import OrderStatusControl from "@/components/OrderStatusControl";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="disp mb-7 text-3xl text-bone">Pesanan <span className="text-muted">({orders.length})</span></h1>

      {orders.length === 0 ? (
        <div className="rounded-xl2 border border-line bg-surface py-20 text-center text-muted">Belum ada pesanan masuk.</div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl2 border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-bone">{o.customerName}</div>
                  <div className="text-[13px] text-muted">{o.email} · {o.phone}</div>
                  <div className="mt-1 max-w-md text-[13px] text-muted">{o.address}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">#{o.id}</div>
                </div>
                <div className="text-right">
                  <div className="disp text-xl text-volt">{rupiah(o.total)}</div>
                  <div className="mt-1 text-[11px] text-muted">{new Date(o.createdAt).toLocaleString("id-ID")}</div>
                  <div className="mt-2"><OrderStatusControl id={o.id} current={o.status} /></div>
                </div>
              </div>

              <div className="mt-4 grid gap-1.5 border-t border-line pt-3">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-[13px]">
                    <span className="text-bone">{it.name} <span className="text-muted">· {it.size} · {it.quantity}×</span></span>
                    <span className="text-muted">{rupiah(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[13px] text-muted">
                  <span>Ongkir {o.shippingCourier ? `· ${o.shippingCourier} ${o.shippingService ?? ""}` : ""}</span>
                  <span>{rupiah(o.shippingCost)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
