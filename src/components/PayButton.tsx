"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PayButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const finalize = async () => {
    try { await fetch(`/api/payment/status?order_id=${orderId}`); } catch {}
    router.refresh();
  };

  const pay = async () => {
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/payment/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat pembayaran");
      if (!window.snap) throw new Error("Snap belum termuat, muat ulang halaman.");
      window.snap.pay(data.token, {
        onSuccess: finalize, onPending: finalize, onError: finalize, onClose: finalize,
      });
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={pay} disabled={loading}
        className="rounded-full bg-volt px-7 py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark disabled:opacity-60">
        {loading ? "Memuat…" : "Lanjutkan Pembayaran"}
      </button>
      {msg && <p className="mt-2 text-sm text-volt">{msg}</p>}
    </div>
  );
}
