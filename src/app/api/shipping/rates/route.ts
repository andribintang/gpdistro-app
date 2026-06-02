import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCost, rajaongkirConfigured, type RateItem } from "@/lib/rajaongkir";

type Body = {
  destinationCityId: string;
  items: { id: string; quantity: number }[];
};

export async function POST(req: Request) {
  try {
    const { destinationCityId, items } = (await req.json()) as Body;
    if (!destinationCityId && rajaongkirConfigured()) {
      return NextResponse.json({ error: "Pilih kota tujuan dulu." }, { status: 400 });
    }
    if (!items?.length) {
      return NextResponse.json({ error: "Keranjang kosong." }, { status: 400 });
    }

    const ids = [...new Set(items.map((i) => i.id))];
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });

    const rateItems: RateItem[] = items.map((i) => {
      const p = products.find((x) => x.id === i.id);
      if (!p) throw new Error("Produk tidak ditemukan.");
      return { weight: p.weightGram, quantity: i.quantity };
    });

    const options = await getCost(destinationCityId, rateItems);
    return NextResponse.json({ options });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Gagal menghitung ongkir." }, { status: 400 });
  }
}
