"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { rupiah } from "@/lib/format";
import CitySelect from "@/components/CitySelect";

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
const SNAP_SRC =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

type Address = { id: string; label: string; recipient: string; phone: string; address: string; cityId: string; cityLabel: string; isDefault: boolean };
type ShipOption = { courier: string; courierName: string; service: string; serviceName: string; price: number; etaText: string };

export default function CartPage() {
  const { items, setQty, remove, total, clear } = useCart();
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [useNew, setUseNew] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", cityId: "", cityLabel: "" });

  const [options, setOptions] = useState<ShipOption[] | null>(null);
  const [ship, setShip] = useState<ShipOption | null>(null);
  const [shipLoading, setShipLoading] = useState(false);
  const [shipErr, setShipErr] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((d) => {
        setLoggedIn(!!d.loggedIn);
        setAddresses(d.addresses ?? []);
        if (d.addresses?.length) setSelectedId(d.addresses[0].id);
        else setUseNew(true);
        if (d.email) setForm((f) => ({ ...f, email: d.email }));
      })
      .catch(() => setUseNew(true));
  }, []);

  const resetShipping = () => { setOptions(null); setShip(null); setShipErr(""); };

  const destCityId = () => (!useNew && selectedId
    ? addresses.find((a) => a.id === selectedId)?.cityId ?? ""
    : form.cityId);

  const fetchRates = async () => {
    const city = destCityId();
    if (!city) { setShipErr("Pilih kota tujuan dulu."); return; }
    setShipLoading(true); setShipErr(""); setOptions(null); setShip(null);
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationCityId: city, items: items.map((i) => ({ id: i.id, quantity: i.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghitung ongkir");
      setOptions(data.options);
      if (data.options?.length) setShip(data.options[0]);
    } catch (e: any) {
      setShipErr(e.message);
    } finally {
      setShipLoading(false);
    }
  };

  const goToOrder = async (orderId: string) => {
    try { await fetch(`/api/payment/status?order_id=${orderId}`); } catch {}
    router.push(`/order/${orderId}`);
  };

  const checkout = async () => {
    if (!ship) { setMsg("Pilih metode pengiriman dulu."); return; }
    setLoading(true); setMsg("");
    try {
      const body: any = {
        items: items.map((i) => ({ id: i.id, size: i.size, quantity: i.quantity })),
        shipping: { courier: ship.courier, service: ship.service },
      };
      if (!useNew && selectedId) body.addressId = selectedId;
      else body.customer = form;

      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal checkout");

      const orderId: string = data.orderId;
      clear();

      if (data.token && window.snap) {
        window.snap.pay(data.token, {
          onSuccess: () => goToOrder(orderId), onPending: () => goToOrder(orderId),
          onError: () => goToOrder(orderId), onClose: () => goToOrder(orderId),
        });
      } else {
        if (data.paymentError) setMsg(data.paymentError);
        router.push(`/order/${orderId}`);
      }
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[600px] px-5 py-24 text-center">
        <div className="mb-4 text-6xl">🛒</div>
        <h1 className="disp mb-2 text-3xl text-bone">Keranjang Kosong</h1>
        <p className="mb-8 text-muted">Belum ada item. Yuk pilih dulu.</p>
        <Link href="/products" className="rounded-full bg-volt px-7 py-3 font-extrabold uppercase tracking-wide text-bg hover:bg-volt-dark">Mulai Belanja</Link>
      </div>
    );
  }

  const input = "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-bone outline-none placeholder:text-muted focus:border-volt";
  const showManual = useNew || addresses.length === 0;
  const subtotal = total();
  const grand = subtotal + (ship?.price ?? 0);

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-8">
      <Script src={SNAP_SRC} data-client-key={CLIENT_KEY} strategy="afterInteractive" />
      <h1 className="disp mb-6 text-4xl text-bone">Keranjang</h1>
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-3">
          {items.map((i) => (
            <div key={i.key} className="flex items-center gap-4 rounded-xl2 border border-line bg-surface p-4">
              <div className="grid h-20 w-20 flex-none place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-surface2 to-bg text-3xl">
                {i.image ? <img src={i.image} alt={i.name} className="h-full w-full object-cover" /> : i.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted">{i.category}</div>
                <Link href={`/products/${i.slug}`} className="block truncate font-bold text-bone hover:text-volt">{i.name}</Link>
                <div className="mt-0.5 text-[12px] text-muted">Ukuran: <span className="font-bold text-bone">{i.size}</span></div>
                <div className="font-extrabold text-bone">{rupiah(i.price)}</div>
              </div>
              <div className="flex items-center rounded-full border border-line">
                <button onClick={() => setQty(i.key, i.quantity - 1)} className="grid h-8 w-8 place-items-center text-lg">−</button>
                <span className="w-7 text-center text-sm font-bold">{i.quantity}</span>
                <button onClick={() => setQty(i.key, i.quantity + 1)} className="grid h-8 w-8 place-items-center text-lg">+</button>
              </div>
              <button onClick={() => remove(i.key)} className="text-xl text-muted hover:text-volt" title="Hapus">🗑️</button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl2 border border-line bg-surface p-6">
          <h2 className="disp mb-4 text-xl text-bone">Alamat Pengiriman</h2>

          {loggedIn && addresses.length > 0 && !useNew && (
            <div className="mb-4 grid gap-2">
              {addresses.map((a) => (
                <label key={a.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${selectedId === a.id ? "border-volt" : "border-line"}`}>
                  <input type="radio" name="addr" checked={selectedId === a.id} onChange={() => { setSelectedId(a.id); resetShipping(); }} className="mt-1 accent-volt" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-bone">{a.label}</span>
                      {a.isDefault && <span className="rounded-full bg-volt/15 px-2 py-0.5 text-[10px] font-bold text-volt">Utama</span>}
                    </div>
                    <div className="text-[13px] text-bone">{a.recipient} · {a.phone}</div>
                    <div className="text-[12px] text-muted">{a.address}{a.cityLabel && ` · ${a.cityLabel}`}</div>
                    {!a.cityId && <div className="text-[11.5px] text-volt">Alamat ini belum ada kota — <Link href={`/account/addresses/${a.id}`} className="underline">lengkapi</Link>.</div>}
                  </div>
                </label>
              ))}
              <button onClick={() => { setUseNew(true); resetShipping(); }} className="mt-1 text-left text-[13px] font-bold text-volt">+ Pakai alamat lain</button>
            </div>
          )}

          {showManual && (
            <div className="mb-4 grid gap-3">
              {!loggedIn && (
                <p className="text-[12.5px] text-muted">Punya akun? <Link href="/account/login" className="font-bold text-volt">Masuk</Link> agar alamat tersimpan.</p>
              )}
              <input className={input} placeholder="Nama penerima" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={input} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={input} placeholder="No. WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea className={input} rows={2} placeholder="Alamat lengkap" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <CitySelect
                defaultCityId={form.cityId}
                defaultCityLabel={form.cityLabel}
                onChange={(id, label) => { setForm((f) => ({ ...f, cityId: id, cityLabel: label })); resetShipping(); }}
              />
              {loggedIn && addresses.length > 0 && (
                <button onClick={() => { setUseNew(false); resetShipping(); }} className="text-left text-[13px] font-bold text-volt">← Pakai alamat tersimpan</button>
              )}
            </div>
          )}

          {/* PENGIRIMAN */}
          <h2 className="disp mb-3 text-xl text-bone">Pengiriman</h2>
          {!options && (
            <button onClick={fetchRates} disabled={shipLoading}
              className="mb-3 w-full rounded-full border border-volt py-2.5 text-sm font-extrabold uppercase tracking-wide text-volt transition hover:bg-volt hover:text-bg disabled:opacity-60">
              {shipLoading ? "Menghitung…" : "Hitung Ongkir"}
            </button>
          )}
          {shipErr && <p className="mb-3 text-sm text-volt">{shipErr}</p>}
          {options && (
            <div className="mb-4 grid max-h-60 gap-2 overflow-y-auto pr-1">
              {options.length === 0 && <p className="text-sm text-muted">Tidak ada layanan untuk tujuan ini.</p>}
              {options.map((o, idx) => (
                <label key={idx} className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-3 ${ship === o ? "border-volt" : "border-line"}`}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="ship" checked={ship === o} onChange={() => setShip(o)} className="accent-volt" />
                    <div>
                      <div className="text-sm font-bold text-bone">{o.courierName} · {o.serviceName}</div>
                      <div className="text-[12px] text-muted">{o.etaText}</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-bone">{rupiah(o.price)}</span>
                </label>
              ))}
              <button onClick={fetchRates} className="text-left text-[12px] font-bold text-volt">↻ Hitung ulang</button>
            </div>
          )}

          {/* RINGKASAN */}
          <div className="my-4 grid gap-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{rupiah(subtotal)}</span></div>
            <div className="flex justify-between text-muted"><span>Ongkir</span><span>{ship ? rupiah(ship.price) : "—"}</span></div>
            <div className="mt-1 flex justify-between border-t border-line pt-2">
              <span className="font-bold text-bone">Total</span>
              <span className="disp text-2xl text-volt">{rupiah(grand)}</span>
            </div>
          </div>

          {msg && <p className="mb-3 text-sm text-volt">{msg}</p>}

          <button onClick={checkout} disabled={loading || !ship}
            className="w-full rounded-full bg-volt py-3.5 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark disabled:opacity-50">
            {loading ? "Memproses…" : "Bayar Sekarang"}
          </button>
          <p className="mt-3 text-center text-[11.5px] text-muted">Pembayaran aman via Midtrans · kartu, e-wallet, VA, QRIS</p>
        </div>
      </div>
    </div>
  );
}
