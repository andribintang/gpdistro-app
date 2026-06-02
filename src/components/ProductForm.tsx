"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";
import type { ProductInput, SizeInput } from "@/app/admin/actions";

type Category = { id: string; name: string };

export default function ProductForm({
  categories,
  initial,
  action,
  submitLabel,
}: {
  categories: Category[];
  initial?: Partial<ProductInput>;
  action: (data: ProductInput) => Promise<void>;
  submitLabel: string;
}) {
  const [pending, start] = useTransition();
  const [f, setF] = useState<ProductInput>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    basePrice: initial?.basePrice ?? 0,
    oldPrice: initial?.oldPrice ?? null,
    material: initial?.material ?? "Cotton Combed 24s",
    fit: initial?.fit ?? "Regular",
    weightGram: initial?.weightGram ?? 250,
    emoji: initial?.emoji ?? "👕",
    description: initial?.description ?? "",
    isBestSeller: initial?.isBestSeller ?? false,
    isNew: initial?.isNew ?? false,
    isActive: initial?.isActive ?? true,
    sizes: initial?.sizes ?? [{ label: "S", stock: 0 }, { label: "M", stock: 0 }, { label: "L", stock: 0 }, { label: "XL", stock: 0 }],
    images: initial?.images ?? [],
  });
  const [err, setErr] = useState("");

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setF((s) => ({ ...s, [k]: v }));
  const setSize = (i: number, patch: Partial<SizeInput>) =>
    setF((s) => ({ ...s, sizes: s.sizes.map((sz, idx) => (idx === i ? { ...sz, ...patch } : sz)) }));
  const addSize = () => setF((s) => ({ ...s, sizes: [...s.sizes, { label: "", stock: 0 }] }));
  const delSize = (i: number) => setF((s) => ({ ...s, sizes: s.sizes.filter((_, idx) => idx !== i) }));

  const submit = () => {
    if (!f.name.trim()) return setErr("Nama produk wajib diisi.");
    if (f.basePrice <= 0) return setErr("Harga harus lebih dari 0.");
    const sizes = f.sizes.filter((s) => s.label.trim());
    if (sizes.length === 0) return setErr("Minimal satu ukuran.");
    setErr("");
    start(() => action({ ...f, sizes }));
  };

  const field = "w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-bone outline-none placeholder:text-muted focus:border-volt";
  const label = "mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-muted";

  return (
    <div className="max-w-3xl">
      <div className="grid gap-5">
        <div>
          <label className={label}>Nama produk</label>
          <input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Oversized Tee 'Concrete'" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Slug (URL) — kosongkan untuk otomatis</label>
            <input className={field} value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="tee-concrete" />
          </div>
          <div>
            <label className={label}>Kategori</label>
            <select className={field} value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={label}>Harga (Rp)</label>
            <input type="number" className={field} value={f.basePrice} onChange={(e) => set("basePrice", Number(e.target.value))} />
          </div>
          <div>
            <label className={label}>Harga coret (opsional)</label>
            <input type="number" className={field} value={f.oldPrice ?? ""} onChange={(e) => set("oldPrice", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div>
            <label className={label}>Emoji / ikon</label>
            <input className={field} value={f.emoji} onChange={(e) => set("emoji", e.target.value)} maxLength={4} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Bahan</label>
            <input className={field} value={f.material} onChange={(e) => set("material", e.target.value)} />
          </div>
          <div>
            <label className={label}>Fit</label>
            <input className={field} value={f.fit} onChange={(e) => set("fit", e.target.value)} placeholder="Oversized / Regular / Boxy" />
          </div>
        </div>

        <div>
          <label className={label}>Berat (gram) — untuk hitung ongkir</label>
          <input type="number" className={`${field} max-w-[200px]`} value={f.weightGram} onChange={(e) => set("weightGram", Number(e.target.value))} />
        </div>

        <div>
          <label className={label}>Deskripsi</label>
          <textarea rows={3} className={field} value={f.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div>
          <label className={label}>Foto produk</label>
          <ImageUploader images={f.images} onChange={(imgs) => set("images", imgs)} />
        </div>

        {/* sizes */}
        <div>
          <label className={label}>Ukuran & stok</label>
          <div className="grid gap-2">
            {f.sizes.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={`${field} w-28`} value={s.label} onChange={(e) => setSize(i, { label: e.target.value })} placeholder="M / 32 / All Size" />
                <input type="number" className={`${field} w-28`} value={s.stock} onChange={(e) => setSize(i, { stock: Number(e.target.value) })} placeholder="stok" />
                <button onClick={() => delSize(i)} className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-line text-muted hover:border-volt hover:text-volt">×</button>
              </div>
            ))}
          </div>
          <button onClick={addSize} className="mt-2 text-[13px] font-bold uppercase tracking-wide text-volt">+ Tambah ukuran</button>
        </div>

        {/* flags */}
        <div className="flex flex-wrap gap-5">
          {([["isActive", "Aktif"], ["isBestSeller", "Best Seller"], ["isNew", "New Arrival"]] as const).map(([k, lbl]) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-bone">
              <input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-volt" />
              {lbl}
            </label>
          ))}
        </div>

        {err && <p className="text-sm text-volt">{err}</p>}

        <div className="flex gap-3">
          <button onClick={submit} disabled={pending} className="rounded-full bg-volt px-6 py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark disabled:opacity-60">
            {pending ? "Menyimpan…" : submitLabel}
          </button>
          <Link href="/admin/products" className="rounded-full border border-line px-6 py-3 font-extrabold uppercase tracking-wide text-bone hover:border-volt hover:text-volt">Batal</Link>
        </div>
      </div>
    </div>
  );
}
