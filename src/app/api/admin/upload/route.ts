import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { isAuthed } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_INPUT = 20 * 1024 * 1024; // 20MB sebelum kompres
const TARGET = 100 * 1024; // target ≤100KB

// Resize + konversi WebP, turunkan kualitas/dimensi bertahap sampai ≤100KB.
async function compress(input: Buffer): Promise<Buffer> {
  let best: Buffer | null = null;
  for (const width of [1280, 1000, 800, 640, 512]) {
    for (const quality of [78, 64, 50, 40, 32]) {
      const out = await sharp(input)
        .rotate() // hormati orientasi EXIF
        .resize({ width, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
      if (!best || out.length < best.length) best = out;
      if (out.length <= TARGET) return out;
    }
  }
  return best as Buffer; // hasil terkecil meski sedikit di atas target
}

export async function POST(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "Tidak ada file." }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    const results: { url: string; sizeKb: number }[] = [];
    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        throw new Error(`Format ${file.type || "tidak dikenal"} tidak didukung (JPG/PNG/WebP/GIF).`);
      }
      if (file.size > MAX_INPUT) throw new Error(`"${file.name}" melebihi 20MB.`);

      const input = Buffer.from(await file.arrayBuffer());
      const compressed = await compress(input);

      const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.webp`;
      await writeFile(path.join(dir, name), compressed);
      results.push({ url: `/uploads/${name}`, sizeKb: Math.round(compressed.length / 1024) });
    }

    return NextResponse.json({
      urls: results.map((r) => r.url),
      sizes: results.map((r) => r.sizeKb),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Gagal mengunggah." }, { status: 400 });
  }
}
