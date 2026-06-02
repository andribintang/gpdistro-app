"use client";

import Link from "next/link";
import { useState } from "react";
import { rupiah, discountPct } from "@/lib/format";
import { totalStock } from "@/lib/types";
import type { ProductCardData } from "@/lib/types";

export default function ProductCard({ p }: { p: ProductCardData }) {
  const [liked, setLiked] = useState(false);
  const pct = discountPct(p.basePrice, p.oldPrice);
  const soldOut = totalStock(p.sizes) <= 0;

  return (
    <Link
      href={`/products/${p.slug}`}
      className="group relative block overflow-hidden rounded-xl2 border border-line bg-surface transition hover:-translate-y-1 hover:border-volt/60 hover:shadow-card"
    >
      {/* badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {soldOut ? (
          <span className="rounded-full bg-bg/80 px-2.5 py-1 text-[10.5px] font-extrabold uppercase text-muted">Sold Out</span>
        ) : (
          <>
            {pct > 0 && <span className="rounded-full bg-volt px-2.5 py-1 text-[10.5px] font-extrabold uppercase text-bg">-{pct}%</span>}
            {p.isNew && <span className="rounded-full border border-volt px-2.5 py-1 text-[10.5px] font-extrabold uppercase text-volt">New</span>}
          </>
        )}
      </div>
      <button
        onClick={(e) => { e.preventDefault(); setLiked((v) => !v); }}
        className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border border-line bg-bg/70 text-[15px] text-muted hover:text-volt"
      >
        {liked ? "♥" : "♡"}
      </button>

      <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-surface2 to-bg ${soldOut ? "opacity-40 grayscale" : ""}`}>
        {p.image ? (
          <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-[58px]">{p.emoji}</div>
        )}
      </div>

      <div className="p-3.5 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted">{p.categoryName}</span>
        <h3 className="mb-2 mt-1 font-sans text-[15px] font-bold leading-tight text-bone group-hover:text-volt">{p.name}</h3>

        <div className="flex items-baseline gap-2">
          <span className="font-sans text-[16px] font-extrabold text-bone">{rupiah(p.basePrice)}</span>
          {p.oldPrice && <span className="text-xs font-semibold text-muted line-through">{rupiah(p.oldPrice)}</span>}
        </div>

        {/* ukuran tersedia */}
        <div className="mt-3 flex flex-wrap gap-1">
          {p.sizes.map((s) => (
            <span
              key={s.label}
              className={`min-w-7 rounded border px-1.5 py-0.5 text-center text-[10.5px] font-bold ${
                s.stock > 0 ? "border-line text-bone" : "border-line/50 text-muted line-through"
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>

        <div className={`mt-3 w-full rounded-full py-2 text-center text-[13px] font-extrabold uppercase tracking-wide transition ${
          soldOut ? "bg-surface2 text-muted" : "bg-bone text-bg group-hover:bg-volt"
        }`}>
          {soldOut ? "Habis" : "Pilih Ukuran →"}
        </div>
      </div>
    </Link>
  );
}
