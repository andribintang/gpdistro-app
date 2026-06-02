const KEY = process.env.RAJAONGKIR_API_KEY || "";
const BASE = process.env.RAJAONGKIR_BASE_URL || "https://api.rajaongkir.com/starter";
const ORIGIN = process.env.RAJAONGKIR_ORIGIN_CITY_ID || "";
const COURIERS = (process.env.RAJAONGKIR_COURIERS || "jne,pos,tiki").split(",").map((c) => c.trim()).filter(Boolean);

export type City = { id: string; label: string };
export type ShippingOption = {
  courier: string; courierName: string;
  service: string; serviceName: string;
  price: number; etaText: string;
};
export type RateItem = { weight: number; quantity: number };

export const rajaongkirConfigured = () => !!KEY && !!ORIGIN;

// cache daftar kota di memori (jarang berubah)
let cityCache: City[] | null = null;

export async function getCities(): Promise<City[]> {
  if (!KEY) return [];
  if (cityCache) return cityCache;
  const res = await fetch(`${BASE}/city`, { headers: { key: KEY } });
  const data = await res.json();
  const results = data?.rajaongkir?.results ?? [];
  cityCache = results.map((c: any) => ({
    id: String(c.city_id),
    label: `${c.type} ${c.city_name}, ${c.province}`,
  }));
  return cityCache!;
}

export async function cityLabel(id: string): Promise<string> {
  try {
    const cities = await getCities();
    return cities.find((c) => c.id === id)?.label ?? "";
  } catch {
    return "";
  }
}

export async function getCost(destinationCityId: string, items: RateItem[]): Promise<ShippingOption[]> {
  const totalWeight = Math.max(1, items.reduce((n, i) => n + i.weight * i.quantity, 0));

  // Fallback dev: estimasi flat tanpa API key.
  if (!rajaongkirConfigured()) {
    return [{
      courier: "flat", courierName: "Estimasi",
      service: "reg", serviceName: "Reguler",
      price: 20000, etaText: "2-4 hari (atur API RajaOngkir)",
    }];
  }

  const options: ShippingOption[] = [];
  for (const courier of COURIERS) {
    const res = await fetch(`${BASE}/cost`, {
      method: "POST",
      headers: { key: KEY, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        origin: ORIGIN,
        destination: destinationCityId,
        weight: String(totalWeight),
        courier,
      }),
    });
    const data = await res.json();
    const results = data?.rajaongkir?.results ?? [];
    for (const r of results) {
      for (const c of r.costs ?? []) {
        const detail = c.cost?.[0] ?? {};
        options.push({
          courier: r.code,
          courierName: r.name,
          service: c.service,
          serviceName: c.description || c.service,
          price: detail.value ?? 0,
          etaText: detail.etd ? `${detail.etd} hari` : "-",
        });
      }
    }
  }
  return options;
}
