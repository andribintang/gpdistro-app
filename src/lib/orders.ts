import { prisma } from "@/lib/prisma";

// Update status order. Jika order dibatalkan (dari status non-cancel),
// kembalikan stok per ukuran agar inventaris akurat.
export async function applyOrderStatus(orderId: string, newStatus: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return null;
  if (order.status === newStatus) return order.status;

  if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
    for (const it of order.items) {
      await prisma.productSize.updateMany({
        where: { productId: it.productId, label: it.size },
        data: { stock: { increment: it.quantity } },
      });
    }
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: newStatus } });
  return newStatus;
}
