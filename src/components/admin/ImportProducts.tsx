"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/admin/ui/kit";

export default function ImportProducts() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!file) { setErr("Pilih file Excel dulu."); return; }
    setLoading(true); setErr(""); setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/products/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal import");
      setResult(data);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Import Produk (Excel)" desc="Unduh template, isi, lalu unggah. Kolom gambar dikosongkan — foto ditambahkan manual setelah import.">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/api/admin/products/template"
          className="rounded-full border border-line px-4 py-2.5 text-[13px] font-bold text-bone transition hover:border-volt hover:text-volt"
        >
          ⬇ Unduh Template
        </a>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setErr(""); }}
          className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface2 file:px-4 file:py-2 file:text-[13px] file:font-bold file:text-bone hover:file:text-volt"
        />

        <button
          onClick={submit}
          disabled={loading || !file}
          className="rounded-full bg-volt px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark disabled:opacity-50"
        >
          {loading ? "Mengimpor…" : "Import"}
        </button>
      </div>

      {err && <p className="mt-3 text-sm text-volt">{err}</p>}

      {result && (
        <div className="mt-4 rounded-xl border border-line bg-bg p-4 text-sm">
          <p className="font-bold text-bone">✓ {result.created} produk ditambahkan{result.skipped ? `, ${result.skipped} dilewati` : ""}.</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 grid gap-1 text-[13px] text-muted">
              {result.errors.slice(0, 10).map((e, i) => <li key={i}>• {e}</li>)}
              {result.errors.length > 10 && <li>…dan {result.errors.length - 10} lainnya</li>}
            </ul>
          )}
        </div>
      )}
    </SectionCard>
  );
}
