import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTransactionStatus, mapStatus } from "@/lib/midtrans";
import { applyOrderStatus } from "@/lib/orders";

// Dipanggil frontend setelah popup Snap selesai. Server menanyakan status
// langsung ke Midtrans (tepercaya), lalu memperbarui status order.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  if (!orderId) return NextResponse.json({ error: "order_id wajib." }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });

  try {
    const { ok, data } = await getTransactionStatus(orderId);
    if (ok && data?.transaction_status) {
      const mapped = mapStatus(data.transaction_status, data.fraud_status);
      await applyOrderStatus(orderId, mapped);
      return NextResponse.json({ status: mapped, raw: data.transaction_status });
    }
  } catch {
    // diamkan: kalau Midtrans tak terjangkau, kembalikan status DB saat ini
  }
  return NextResponse.json({ status: order.status });
}
