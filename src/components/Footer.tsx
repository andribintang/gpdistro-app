import Link from "next/link";

const cols = [
  { h: "Belanja", links: [["Kaos", "/products?category=kaos"], ["Kemeja", "/products?category=kemeja"], ["Hoodie & Jaket", "/products?category=hoodie-jaket"], ["Celana", "/products?category=celana"], ["Aksesoris", "/products?category=aksesoris"]] },
  { h: "Bantuan", links: [["Panduan Ukuran", "/products"], ["Cara Order", "/products"], ["Tukar & Retur", "/products"], ["Lacak Pesanan", "/products"]] },
  { h: "GPDISTRO", links: [["Tentang Kami", "/products"], ["Lookbook", "/products"], ["Store Lokasi", "/products"], ["Kontak", "/products"]] },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface py-12 text-sm text-muted">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <div className="disp mb-3 text-3xl text-bone">GP<span className="text-volt">DISTRO</span></div>
            <p className="max-w-[280px]">Streetwear original buatan lokal. Bahan premium, ukuran lengkap, dikirim cepat ke seluruh Indonesia.</p>
            <div className="mt-4 flex gap-2.5">
              {["IG", "TT", "WA", "SHOPEE"].map((s) => (
                <span key={s} className="grid h-9 min-w-9 place-items-center rounded-full border border-line px-2 text-[11px] font-bold text-bone hover:border-volt hover:text-volt">{s}</span>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h5 className="mb-3.5 text-[12px] font-extrabold uppercase tracking-widest text-bone">{c.h}</h5>
              <ul className="grid gap-2.5">
                {c.links.map(([l, href]) => (
                  <li key={l}><Link href={href} className="hover:text-volt">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap gap-1.5">
          {["VISA", "Master", "BCA", "Mandiri", "GoPay", "OVO", "DANA", "ShopeePay", "Kredivo"].map((p) => (
            <span key={p} className="rounded-md border border-line bg-surface2 px-2 py-1 text-[10px] font-bold text-bone">{p}</span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-line pt-5 text-[12px]">
          <span>© 2026 GPDISTRO. Demo full-stack — silakan kustomisasi.</span>
          <span>Kebijakan Privasi · Syarat & Ketentuan</span>
        </div>
      </div>
    </footer>
  );
}
