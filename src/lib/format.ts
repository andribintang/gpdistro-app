export const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

export const discountPct = (base: number, old?: number | null) =>
  old && old > base ? Math.round(((old - base) / old) * 100) : 0;
