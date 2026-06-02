const KEY = process.env.BITESHIP_API_KEY || "";
const ORIGIN = process.env.STORE_ORIGIN_POSTAL_CODE || "";
const COURIERS = process.env.BITESHIP_COURIERS || "jne,jnt,sicepat,anteraja,ide,pos,tiki,ninja,lion,wahana";

export type RateItem = { name: string; value: number; weight: number; quantity: number };
export type ShippingOption = {
  courier: string;       // kode kurir, mis. "jne"
  courierName: string;   // "JNE"
  service: string;       // kode layanan, mis. "reg"
  serviceName: string;   // "Layanan Reguler"
  price: number;
  etaText: string;
};

export const biteshipConfigured = () => !!KEY && !!ORIGIN;

export async function getRates(destinationPostalCode: string, items: RateItem[]): Promise<ShippingOption[]> {
  // Fallback dev: estimasi flat agar alur checkout tetap jalan tanpa API key.
  if (!biteshipConfigured()) {
    return [{
      courier: "flat", courierName: "Estimasi",
      service: "reg", serviceName: "Reguler",
      price: 20000, etaText: "2-4 hari (atur API Biteship)",
    }];
  }

  const res = await fetch("https://api.biteship.com/v1/rates/couriers", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: KEY },
    body: JSON.stringify({
      origin_postal_code: Number(ORIGIN),
      destination_postal_code: Number(destinationPostalCode),
      couriers: COURIERS,
      items: items.map((i) => ({
        name: i.name.slice(0, 60), value: i.value, weight: i.weight, quantity: i.quantity,
      })),
    }),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data?.error || "Gagal mengambil ongkir dari Biteship.");
  }

  return (data.pricing || []).map((p: any): ShippingOption => ({
    courier: p.company ?? p.courier_code ?? "",
    courierName: p.courier_name ?? p.company ?? "Kurir",
    service: p.courier_service_code ?? "",
    serviceName: p.courier_service_name ?? "",
    price: p.price ?? 0,
    etaText: p.duration ?? [p.shipment_duration_range, p.shipment_duration_unit].filter(Boolean).join(" "),
  }));
}
