"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { rupiah } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";

export type AdminProductRow = {
  id: string;
  name: string;
  category: string;
  image: string | null;
  emoji: string;
  basePrice: number;
  oldPrice: number | null;
  stock: number;
  sizes: string[];
  active: boolean;
  bestSeller: boolean;
  isNew: boolean;
};

type SortKey = "newest" | "price-asc" | "price-desc" | "stock-asc";

function StockCell({ stock }: { stock: number }) {
  const color = stock === 0 ? "text-red-500" : stock <= 5 ? "text-amber-500" : "text-emerald-500";
  const dot = stock === 0 ? "bg-red-500" : stock <= 5 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className={`font-bold ${color}`}>{stock}</span>
    </span>
  );
}

export default function ProductsTable({
  products,
  categories,
}: {
  products: AdminProductRow[];
  categories: string[];
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const rows = useMemo(() => {
    let r = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (cat) r = r.filter((p) => p.category === cat);
    const s = [...r];
    if (sort === "price-asc") s.sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === "price-desc") s.sort((a, b) => b.basePrice - a.basePrice);
    else if (sort === "stock-asc") s.sort((a, b) => a.stock - b.stock);
    return s;
  }, [products, q, cat, sort]);

  const control = "rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-bone outline-none focus:border-volt";

  return (
    <div>
      {/* toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk…"
            className={`${control} w-full pl-10`}
          />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={control}>
          <option value="">Semua kategori</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={control}>
          <option value="newest">Terbaru</option>
          <option value="price-asc">Harga ↑</option>
          <option value="price-desc">Harga ↓</option>
          <option value="stock-asc">Stok paling sedikit</option>
        </select>
      </div>

      {/* card berisi tabel */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface2 text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5 font-semibold">Produk</th>
                <th className="px-4 py-3.5 font-semibold">Kategori</th>
                <th className="px-4 py-3.5 font-semibold">Harga</th>
                <th className="px-4 py-3.5 font-semibold">Stok</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="group border-b border-line/60 transition-colors last:border-0 hover:bg-surface2/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-xl border border-line bg-bg text-xl">
                        {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : p.emoji}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-bone">{p.name}</span>
                          {p.bestSeller && <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-amber-500">Best</span>}
                          {p.isNew && <span className="rounded bg-volt/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-volt">New</span>}
                        </div>
                        <div className="mt-0.5 truncate text-[12px] text-muted">{p.sizes.join(" · ") || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full border border-line px-2.5 py-1 text-[12px] font-medium text-muted">{p.category}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-bone">{rupiah(p.basePrice)}</div>
                    {p.oldPrice && <div className="text-[12px] text-muted line-through">{rupiah(p.oldPrice)}</div>}
                  </td>
                  <td className="px-4 py-3.5"><StockCell stock={p.stock} /></td>
                  <td className="px-4 py-3.5">
                    {p.active
                      ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Aktif</span>
                      : <span className="inline-flex items-center gap-1.5 rounded-full bg-surface2 px-2.5 py-1 text-[11.5px] font-semibold text-muted"><span className="h-1.5 w-1.5 rounded-full bg-muted" />Nonaktif</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                      <Link href={`/admin/products/${p.id}`} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-bone hover:border-volt hover:text-volt">Edit</Link>
                      <DeleteButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="py-16 text-center text-muted">Tidak ada produk yang cocok.</div>
        )}
      </div>

      <p className="mt-3 text-[12px] text-muted">Menampilkan {rows.length} dari {products.length} produk</p>
    </div>
  );
}
