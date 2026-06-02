import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSnapToken } from "@/lib/midtrans";
import { getCurrentUser } from "@/lib/auth-customer";
import { getCost, rajaongkirConfigured, type RateItem } from "@/lib/rajaongkir";

type Body = {
  customer?: { name: string; email: string; phone: string; address: string; cityId: string };
  addressId?: string;
  items: { id: string; size: string; quantity: number }[];
  shipping?: { courier: string; service: string };
};

export async function POST(req: Request) {
  try {
    const { customer, addressId, items, shipping } = (await req.json()) as Body;

    if (!items?.length) {
      return NextResponse.json({ error: "Keranjang kosong." }, { status: 400 });
    }
    if (!shipping?.courier || !shipping?.service) {
      return NextResponse.json({ error: "Pilih metode pengiriman dulu." }, { status: 400 });
    }

    const user = await getCurrentUser();

    // Data pengiriman + kota tujuan (dari alamat tersimpan atau input manual).
    let ship: { name: string; email: string; phone: string; address: string; cityId: string };
    if (addressId) {
      if (!user) return NextResponse.json({ error: "Sesi tidak valid, masuk lagi." }, { status: 401 });
      const addr = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
      if (!addr) return NextResponse.json({ error: "Alamat tidak ditemukan." }, { status: 400 });
      ship = { name: addr.recipient, email: user.email, phone: addr.phone, address: addr.address, cityId: addr.cityId };
    } else {
      if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
        return NextResponse.json({ error: "Data pengiriman belum lengkap." }, { status: 400 });
      }
      ship = customer;
    }

    const ids = [...new Set(items.map((i) => i.id))];
    const products = await prisma.product.findMany({ where: { id: { in: ids } }, include: { sizes: true } });

    const prepared = items.map((i) => {
      const prod = products.find((p) => p.id === i.id);
      if (!prod) throw new Error("Produk tidak ditemukan.");
      const sz = prod.sizes.find((s) => s.label === i.size);
      if (!sz) throw new Error(`Ukuran ${i.size} tidak tersedia untuk ${prod.name}.`);
      if (sz.stock < i.quantity) throw new Error(`Stok ukuran ${i.size} untuk ${prod.name} tidak cukup.`);
      return { prod, sizeId: sz.id, size: i.size, qty: i.quantity };
    });

    const subtotal = prepared.reduce((sum, x) => sum + x.prod.basePrice * x.qty, 0);

    // Hitung ulang ongkir di server (jangan percaya harga dari client).
    if (!ship.cityId && rajaongkirConfigured()) {
      return NextResponse.json({ error: "Kota tujuan belum dipilih." }, { status: 400 });
    }
    const rateItems: RateItem[] = prepared.map((x) => ({ weight: x.prod.weightGram, quantity: x.qty }));
    const options = await getCost(ship.cityId, rateItems);
    const picked = options.find((o) => o.courier === shipping.courier && o.service === shipping.service);
    if (!picked) {
      return NextResponse.json({ error: "Metode pengiriman tidak tersedia, hitung ongkir lagi." }, { status: 400 });
    }
    const shippingCost = picked.price;
    const total = subtotal + shippingCost;

    // 1) simpan order + kurangi stok
    const order = await prisma.order.create({
      data: {
        userId: user?.id ?? null,
        customerName: ship.name, email: ship.email, phone: ship.phone, address: ship.address,
        total, shippingCost,
        shippingCourier: picked.courierName,
        shippingService: picked.serviceName,
        status: "PENDING", paymentRef: null,
        items: {
          create: prepared.map((x) => ({
            productId: x.prod.id, name: x.prod.name, size: x.size,
            price: x.prod.basePrice, quantity: x.qty,
          })),
        },
      },
    });
    for (const x of prepared) {
      await prisma.productSize.update({ where: { id: x.sizeId }, data: { stock: { decrement: x.qty } } });
    }

    // 2) Snap token (item produk + baris ongkir; jumlahnya = total)
    let token: string | null = null;
    let paymentError: string | null = null;
    try {
      token = await createSnapToken({
        orderId: order.id,
        grossAmount: total,
        items: [
          ...prepared.map((x) => ({
            id: x.prod.id, price: x.prod.basePrice, quantity: x.qty, name: `${x.prod.name} (${x.size})`,
          })),
          { id: "shipping", price: shippingCost, quantity: 1, name: `Ongkir ${picked.courierName} ${picked.serviceName}`.slice(0, 50) },
        ],
        customer: { name: ship.name, email: ship.email, phone: ship.phone },
      });
      await prisma.order.update({ where: { id: order.id }, data: { paymentRef: order.id } });
    } catch (e: any) {
      paymentError = e.message ?? "Gagal memulai pembayaran.";
    }

    return NextResponse.json({ orderId: order.id, total, token, paymentError });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Gagal membuat order." }, { status: 400 });
  }
}
