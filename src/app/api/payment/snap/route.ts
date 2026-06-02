import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSnapToken } from "@/lib/midtrans";

export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json()) as { orderId: string };
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    if (order.status === "PAID") return NextResponse.json({ error: "Order sudah dibayar." }, { status: 400 });

    const token = await createSnapToken({
      orderId: order.id,
      grossAmount: order.total,
      items: order.items.map((it) => ({
        id: it.productId, price: it.price, quantity: it.quantity,
        name: `${it.name} (${it.size})`,
      })),
      customer: { name: order.customerName, email: order.email, phone: order.phone },
    });

    return NextResponse.json({ token });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Gagal membuat token." }, { status: 400 });
  }
}
