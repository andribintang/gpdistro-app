"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import type { ProductCardData } from "@/lib/types";

export default function BuyBox({ p }: { p: ProductCardData }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState("");

  const chosen = p.sizes.find((s) => s.label === size);
  const maxQty = chosen?.stock ?? 0;

  const build = () => ({
    id: p.id, slug: p.slug, name: p.name, size: size!,
    price: p.basePrice, emoji: p.emoji, image: p.image, category: p.categoryName,
  });

  const guard = () => {
    if (!size) { setErr("Pilih ukuran dulu ya."); return false; }
    setErr(""); return true;
  };

  return (
    <div>
      {/* ukuran */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] font-bold uppercase tracking-wide text-bone">Ukuran</span>
          <button className="text-[12px] font-semibold text-muted underline hover:text-volt">Panduan ukuran</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.sizes.map((s) => {
            const out = s.stock <= 0;
            const active = size === s.label;
            return (
              <button
                key={s.label}
                disabled={out}
                onClick={() => { setSize(s.label); setQty(1); setErr(""); }}
                className={`min-w-[48px] rounded-lg border px-3 py-2 text-sm font-bold transition ${
                  out ? "cursor-not-allowed border-line/50 text-muted line-through"
                  : active ? "border-volt bg-volt text-bg"
                  : "border-line text-bone hover:border-volt"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {chosen && <p className="mt-2 text-[12px] text-muted">Stok ukuran {chosen.label}: {chosen.stock}</p>}
      </div>

      {/* jumlah */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[13px] font-bold uppercase tracking-wide text-bone">Jumlah</span>
        <div className="flex items-center rounded-full border border-line">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center text-lg">−</button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button onClick={() => setQty((q) => (maxQty ? Math.min(maxQty, q + 1) : q + 1))} className="grid h-9 w-9 place-items-center text-lg">+</button>
        </div>
      </div>

      {err && <p className="mb-3 text-sm text-volt">{err}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => { if (!guard()) return; add(build(), qty); setAdded(true); setTimeout(() => setAdded(false), 1200); }}
          className="flex-1 rounded-full border border-bone py-3 font-extrabold uppercase tracking-wide text-bone transition hover:border-volt hover:text-volt"
        >
          {added ? "✓ Ditambahkan" : "+ Keranjang"}
        </button>
        <button
          onClick={() => { if (!guard()) return; add(build(), qty); router.push("/cart"); }}
          className="flex-1 rounded-full bg-volt py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark"
        >
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
