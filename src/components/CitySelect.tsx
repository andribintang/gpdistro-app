"use client";

import { useEffect, useMemo, useState } from "react";

type City = { id: string; label: string };

export default function CitySelect({
  defaultCityId = "",
  defaultCityLabel = "",
  onChange,
}: {
  defaultCityId?: string;
  defaultCityLabel?: string;
  onChange?: (id: string, label: string) => void;
}) {
  const [cities, setCities] = useState<City[]>([]);
  const [q, setQ] = useState("");
  const [id, setId] = useState(defaultCityId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shipping/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? []))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    const list = term ? cities.filter((c) => c.label.toLowerCase().includes(term)) : cities;
    return list.slice(0, 200);
  }, [cities, q]);

  const label = cities.find((c) => c.id === id)?.label ?? defaultCityLabel;

  const field = "w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-bone outline-none placeholder:text-muted focus:border-volt";

  const pick = (newId: string) => {
    setId(newId);
    onChange?.(newId, cities.find((c) => c.id === newId)?.label ?? "");
  };

  if (!loading && cities.length === 0) {
    // RajaOngkir belum dikonfigurasi → fallback: simpan tanpa kota (estimasi flat)
    return (
      <div>
        <input className={field} placeholder="Kota (aktifkan API RajaOngkir untuk daftar kota)" defaultValue={defaultCityLabel}
          onChange={(e) => onChange?.("", e.target.value)} name="cityLabel" />
        <input type="hidden" name="cityId" value="" />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <input className={field} placeholder="Cari kota/kabupaten…" value={q} onChange={(e) => setQ(e.target.value)} />
      <select
        name="cityId"
        value={id}
        onChange={(e) => pick(e.target.value)}
        className={field}
        size={q ? 6 : 1}
      >
        <option value="">{loading ? "Memuat kota…" : "— Pilih kota tujuan —"}</option>
        {filtered.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>
      <input type="hidden" name="cityLabel" value={label} />
    </div>
  );
}
