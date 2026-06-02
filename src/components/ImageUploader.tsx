"use client";

import { useRef, useState } from "react";
import type { ImageInput } from "@/app/admin/actions";

export default function ImageUploader({
  images,
  onChange,
}: {
  images: ImageInput[];
  onChange: (imgs: ImageInput[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true); setErr(""); setInfo("");
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload");
      const added: ImageInput[] = data.urls.map((url: string) => ({ url, alt: "" }));
      onChange([...images, ...added]);
      if (data.sizes?.length) setInfo(`Dikompres ke WebP: ${data.sizes.map((s: number) => s + "KB").join(", ")}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));
  const makePrimary = (i: number) => {
    const next = [...images];
    const [item] = next.splice(i, 1);
    onChange([item, ...next]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((im, i) => (
          <div key={im.url} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-line bg-surface2">
            <img src={im.url} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-volt px-1.5 py-0.5 text-[10px] font-bold text-bg">Utama</span>}
            <div className="absolute inset-0 flex items-end justify-center gap-1 bg-black/40 p-1 opacity-0 transition group-hover:opacity-100">
              {i !== 0 && (
                <button type="button" onClick={() => makePrimary(i)} title="Jadikan utama"
                  className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-black">★</button>
              )}
              <button type="button" onClick={() => remove(i)} title="Hapus"
                className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-black">✕</button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="grid h-24 w-24 place-items-center rounded-xl border border-dashed border-line text-center text-[12px] font-bold text-muted transition hover:border-volt hover:text-volt disabled:opacity-50"
        >
          {uploading ? "Mengunggah…" : "+ Foto"}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      <p className="mt-2 text-[12px] text-muted">JPG/PNG/WebP, otomatis dikompres ke WebP ≤100KB. Foto pertama jadi gambar utama. Kosongkan untuk pakai emoji.</p>
      {info && <p className="mt-1 text-[12px] text-volt">{info}</p>}
      {err && <p className="mt-1 text-sm text-volt">{err}</p>}
    </div>
  );
}
