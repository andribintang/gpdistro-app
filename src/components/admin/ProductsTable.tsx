"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { rupiah } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { Badge } from "@/components/admin/ui/kit";
import { bulkUpdateProducts, bulkDeleteProducts } from "@/app/admin/actions";

export type AdminProductRow = {
  id: string;
  name: string;
  category: string;
  image: string | null;
  emoji: string;
  basePrice: number;
  costPrice: number;
  oldPrice: number | null;
  stock: number;
  sizes: string[];
  active: boolean;
  bestSeller: boolean;
  isNew: boolean;
};

type Cat = { id: string; name: string };

function StockCell({ stock }: { stock: number }) {
  const tone = stock === 0 ? "red" : stock <= 5 ? "amber" : "green";
  return <Badge tone={tone as any} dot>{stock}</Badge>;
}

function BulkBar({ ids, clear, cats }: { ids: string[]; clear: () => void; cats: Cat[] }) {
  const [pending, start] = useTransition();
  const [cat, setCat] = useState("");
  const run = (fn: () => Promise<void>) => start(async () => { await fn(); clear(); });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={cat} onChange={(e) => setCat(e.target.value)} disabled={pending}
        className="rounded-lg border border-line bg-bg px-2.5 py-1.5 text-[12.5px] text-bone outline-none focus:border-volt">
        <option value="">Pindah kategori…</option>
        {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button disabled={!cat || pending} onClick={() => run(() => bulkUpdateProducts(ids, { categoryId: cat }))}
        className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-bold text-bone hover:border-volt hover:text-volt disabled:opacity-40">Terapkan</button>
      <span className="mx-1 h-5 w-px bg-line" />
      <button disabled={pending} onClick={() => run(() => bulkUpdateProducts(ids, { isActive: true }))}
        className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-bold text-bone hover:border-volt hover:text-volt disabled:opacity-40">Aktifkan</button>
      <button disabled={pending} onClick={() => run(() => bulkUpdateProducts(ids, { isActive: false }))}
        className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-bold text-bone hover:border-volt hover:text-volt disabled:opacity-40">Nonaktifkan</button>
      <button disabled={pending}
        onClick={() => { if (confirm(`Hapus ${ids.length} produk terpilih? (yang sudah ada di pesanan akan dinonaktifkan)`)) run(() => bulkDeleteProducts(ids)); }}
        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-[12.5px] font-bold text-red-500 hover:bg-red-500/10 disabled:opacity-40">Hapus</button>
    </div>
  );
}

export default function ProductsTable({
  products, categories,
}: { products: AdminProductRow[]; categories: Cat[] }) {
  const [cat, setCat] = useState("");
  const rows = cat ? products.filter((p) => p.category === cat) : products;

  const columns: Column<AdminProductRow>[] = [
    {
      key: "name", header: "Produk", sortable: true, sortValue: (p) => p.name.toLowerCase(),
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-xl border border-line bg-bg text-xl">
            {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : p.emoji}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-bone">{p.name}</span>
              {p.bestSeller && <Badge tone="amber">Best</Badge>}
              {p.isNew && <Badge tone="volt">New</Badge>}
            </div>
            <div className="mt-0.5 truncate text-[12px] text-muted">{p.sizes.join(" · ") || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category", header: "Kategori", sortable: true, sortValue: (p) => p.category,
      render: (p) => <span className="rounded-full border border-line px-2.5 py-1 text-[12px] font-medium text-muted">{p.category}</span>,
    },
    {
      key: "price", header: "Jual", sortable: true, sortValue: (p) => p.basePrice,
      render: (p) => (
        <div>
          <div className="font-semibold text-bone">{rupiah(p.basePrice)}</div>
          {p.oldPrice && <div className="text-[12px] text-muted line-through">{rupiah(p.oldPrice)}</div>}
        </div>
      ),
    },
    {
      key: "cost", header: "Beli", sortable: true, sortValue: (p) => p.costPrice,
      render: (p) => <span className="text-muted">{p.costPrice ? rupiah(p.costPrice) : "—"}</span>,
    },
    { key: "stock", header: "Stok", sortable: true, sortValue: (p) => p.stock, render: (p) => <StockCell stock={p.stock} /> },
    {
      key: "status", header: "Status", sortable: true, sortValue: (p) => (p.active ? 1 : 0),
      render: (p) => (p.active ? <Badge tone="green" dot>Aktif</Badge> : <Badge tone="gray" dot>Nonaktif</Badge>),
    },
    {
      key: "actions", header: "Aksi", align: "right",
      render: (p) => (
        <div className="flex justify-end gap-2 opacity-80 transition-opacity group-hover:opacity-100">
          <Link href={`/admin/products/${p.id}`} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-bone hover:border-volt hover:text-volt">Edit</Link>
          <DeleteButton id={p.id} name={p.name} />
        </div>
      ),
    },
  ];

  const filters = (
    <select value={cat} onChange={(e) => setCat(e.target.value)}
      className="rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-bone outline-none focus:border-volt">
      <option value="">Semua kategori</option>
      {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
    </select>
  );

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(p) => p.id}
      searchValue={(p) => p.name + " " + p.category}
      searchPlaceholder="Cari produk…"
      filters={filters}
      pageSize={8}
      selectable
      bulkActions={(ids, clear) => <BulkBar ids={ids} clear={clear} cats={categories} />}
      emptyMessage="Tidak ada produk yang cocok."
    />
  );
}
