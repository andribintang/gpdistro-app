import { NextResponse } from "next/server";
import { getCities } from "@/lib/rajaongkir";

export async function GET() {
  try {
    const cities = await getCities();
    return NextResponse.json({ cities });
  } catch (e: any) {
    return NextResponse.json({ cities: [], error: e.message ?? "Gagal memuat kota." });
  }
}
