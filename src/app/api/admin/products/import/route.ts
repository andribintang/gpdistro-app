import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "produk";

const toBool = (v: any) => {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "ya" || s === "yes" || s === "y";
};
const toNum = (v: any) => {
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// "S:10,M:20,L:15" -> [{label:"S",stock:10}, ...]
function parseSizes(raw: any): { label: string; stock: number }[] {
  return String(raw ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => {
      const [label, stock] = p.split(":");
      return { label: (label ?? "").trim(), stock: toNum(stock), order: i };
    })
    .filter((s) => s.label);
}

export async function POST(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "File tidak ada." }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

    const categories = await prisma.category.findMany();
    const findCat = (name: string) => {
      const t = name.trim().toLowerCase();
      return categories.find((c) => c.name.toLowerCase() === t || c.slug.toLowerCase() === t);
    };

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const line = i + 2; // +1 header, +1 1-indexed
      const name = String(r.name ?? "").trim();
      if (!name) { skipped++; continue; }

      const cat = findCat(String(r.category ?? ""));
      if (!cat) { skipped++; errors.push(`Baris ${line}: kategori "${r.category}" tidak ditemukan.`); continue; }

      const basePrice = toNum(r.basePrice);
      if (basePrice <= 0) { skipped++; errors.push(`Baris ${line}: harga tidak valid.`); continue; }

      const sizes = parseSizes(r.sizes);
      if (sizes.length === 0) { skipped++; errors.push(`Baris ${line}: kolom sizes kosong (mis. "S:10,M:20").`); continue; }

      // slug unik
      let slug = String(r.slug ?? "").trim() || slugify(name);
      if (await prisma.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

      try {
        await prisma.product.create({
          data: {
            name, slug,
            categoryId: cat.id,
            description: String(r.description ?? ""),
            emoji: "👕",
            basePrice,
            costPrice: toNum(r.costPrice),
            oldPrice: r.oldPrice === "" || r.oldPrice == null ? null : toNum(r.oldPrice),
            material: String(r.material ?? "Cotton Combed 24s") || "Cotton Combed 24s",
            fit: String(r.fit ?? "Regular") || "Regular",
            weightGram: toNum(r.weightGram) || 250,
            isActive: r.isActive === "" ? true : toBool(r.isActive),
            isBestSeller: toBool(r.isBestSeller),
            isNew: toBool(r.isNew),
            sizes: { create: sizes },
          },
        });
        created++;
      } catch (e: any) {
        skipped++;
        errors.push(`Baris ${line}: gagal disimpan (${e.code ?? "error"}).`);
      }
    }

    return NextResponse.json({ created, skipped, errors });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Gagal memproses file." }, { status: 400 });
  }
}
