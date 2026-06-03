import * as XLSX from "xlsx";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADER = [
  "name", "slug", "category", "description",
  "basePrice", "oldPrice", "costPrice",
  "material", "fit", "weightGram",
  "sizes", "isActive", "isBestSeller", "isNew",
];

const EXAMPLES = [
  ["Oversized Tee 'Concrete'", "", "Kaos", "Kaos oversized cotton combed.",
   139000, "", 70000, "Cotton Combed 24s", "Oversized", 250, "S:10,M:20,L:15,XL:8", "true", "true", "false"],
  ["Cargo Pants 'Tactical'", "", "Celana", "Celana cargo banyak kantong.",
   289000, 329000, 160000, "Ripstop", "Loose", 600, "M:5,L:5,XL:3", "true", "false", "true"],
];

export async function GET() {
  if (!isAuthed()) return new Response("Unauthorized", { status: 401 });

  const ws = XLSX.utils.aoa_to_sheet([HEADER, ...EXAMPLES]);
  ws["!cols"] = HEADER.map((h) => ({ wch: h === "description" ? 30 : h === "name" ? 26 : h === "sizes" ? 22 : 12 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produk");
  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-produk-gpdistro.xlsx"',
    },
  });
}
