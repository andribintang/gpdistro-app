"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";
import { SectionCard, Field, inputCls } from "@/components/admin/ui/kit";
import type { ProductInput, SizeInput } from "@/app/admin/actions";

type Category = { id: string; name: string };

export default function ProductForm({
  categories, initial, action, submitLabel,
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
    costPrice: initial?.costPrice ?? 0,
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

  return (
    <div className="grid max-w-3xl gap-5">
      <SectionCard title="Informasi Produk">
        <div className="grid gap-4">
          <Field label="Nama produk">
            <input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Oversized Tee 'Concrete'" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug (URL)" hint="Kosongkan untuk otomatis dari nama">
              <input className={inputCls} value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="tee-concrete" />
            </Field>
            <Field label="Kategori">
              <select className={inputCls} value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Deskripsi">
            <textarea rows={3} className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Harga">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Harga jual (Rp)">
            <input type="number" className={inputCls} value={f.basePrice} onChange={(e) => set("basePrice", Number(e.target.value))} />
          </Field>
          <Field label="Harga beli (Rp)" hint="Modal, internal">
            <input type="number" className={inputCls} value={f.costPrice} onChange={(e) => set("costPrice", Number(e.target.value))} />
          </Field>
          <Field label="Harga coret" hint="Opsional">
            <input type="number" className={inputCls} value={f.oldPrice ?? ""} onChange={(e) => set("oldPrice", e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="Emoji / ikon">
            <input className={inputCls} value={f.emoji} onChange={(e) => set("emoji", e.target.value)} maxLength={4} />
          </Field>
        </div>
        {f.costPrice > 0 && f.basePrice > 0 && (
          <p className="mt-3 text-[12.5px] text-muted">Margin: <span className="font-bold text-bone">{Math.round(((f.basePrice - f.costPrice) / f.basePrice) * 100)}%</span> · laba {new Intl.NumberFormat("id-ID").format(f.basePrice - f.costPrice)}/pcs</p>
        )}
      </SectionCard>

      <SectionCard title="Detail">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Bahan"><input className={inputCls} value={f.material} onChange={(e) => set("material", e.target.value)} /></Field>
          <Field label="Fit"><input className={inputCls} value={f.fit} onChange={(e) => set("fit", e.target.value)} placeholder="Oversized / Regular" /></Field>
          <Field label="Berat (gram)" hint="Untuk hitung ongkir"><input type="number" className={inputCls} value={f.weightGram} onChange={(e) => set("weightGram", Number(e.target.value))} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Foto Produk" desc="Foto pertama jadi gambar utama. Dikompres otomatis ke WebP ≤100KB.">
        <ImageUploader images={f.images} onChange={(imgs) => set("images", imgs)} />
      </SectionCard>

      <SectionCard title="Ukuran & Stok">
        <div className="grid gap-2">
          {f.sizes.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputCls} w-32`} value={s.label} onChange={(e) => setSize(i, { label: e.target.value })} placeholder="M / 32 / All Size" />
              <input type="number" className={`${inputCls} w-32`} value={s.stock} onChange={(e) => setSize(i, { stock: Number(e.target.value) })} placeholder="stok" />
              <button onClick={() => delSize(i)} className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-line text-muted transition hover:border-volt hover:text-volt">×</button>
            </div>
          ))}
        </div>
        <button onClick={addSize} className="mt-3 text-[13px] font-bold uppercase tracking-wide text-volt">+ Tambah ukuran</button>
      </SectionCard>

      <SectionCard title="Status">
        <div className="flex flex-wrap gap-5">
          {([["isActive", "Aktif"], ["isBestSeller", "Best Seller"], ["isNew", "New Arrival"]] as const).map(([k, lbl]) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-bone">
              <input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-volt" />
              {lbl}
            </label>
          ))}
        </div>
      </SectionCard>

      {err && <p className="text-sm text-volt">{err}</p>}

      <div className="sticky bottom-0 flex gap-3 rounded-2xl border border-line bg-surface/95 p-4 backdrop-blur">
        <button onClick={submit} disabled={pending} className="rounded-full bg-volt px-6 py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark disabled:opacity-60">
          {pending ? "Menyimpan…" : submitLabel}
        </button>
        <Link href="/admin/products" className="rounded-full border border-line px-6 py-3 font-extrabold uppercase tracking-wide text-bone hover:border-volt hover:text-volt">Batal</Link>
      </div>
    </div>
  );
}
