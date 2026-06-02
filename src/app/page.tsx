import Link from "next/link";
import { getProducts, getCategories, toCard } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const features = [
  ["✶", "100% Original"],
  ["✶", "Tukar Ukuran 7 Hari"],
  ["✶", "Bahan Premium"],
  ["✶", "Dikirim Cepat"],
  ["✶", "COD & Cicilan"],
];
const reviews = [
  ["Reza", "Jakarta", "Bahan kaosnya tebal, sablonnya rapi. Worth it parah."],
  ["Tania", "Bandung", "Hoodie-nya adem tapi anget, fit oversized-nya pas banget."],
  ["Yoga", "Surabaya", "Cargo-nya keren, banyak kantong. Ukuran sesuai chart."],
  ["Nadia", "Depok", "Packaging rapi, dikirim cepet. Bakal repeat order!"],
  ["Fikri", "Bekasi", "Coach jacket-nya solid buat harian. Recommended distro lokal."],
];
const stores = [
  ["GPDISTRO HQ — Bandung", "Jl. Trunojoyo No.12, Bandung", "Setiap hari · 11.00 – 21.00"],
  ["GPDISTRO Jakarta", "Blok M Square Lt. 2, Jaksel", "Setiap hari · 10.00 – 22.00"],
  ["GPDISTRO Surabaya", "Jl. Raya Gubeng No.45", "Setiap hari · 11.00 – 21.00"],
];

export default async function Home() {
  const [best, fresh, cats] = await Promise.all([
    getProducts({ bestSeller: true, take: 8 }),
    getProducts({ isNew: true, take: 4 }),
    getCategories(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line bg-bg">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: "radial-gradient(circle at 78% 12%, #c6ff3a 0, transparent 38%)" }}
        />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-5 py-14 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-volt/50 px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-widest text-volt">
              ✦ New Drop Setiap Jumat
            </span>
            <h1 className="disp mt-4 text-[clamp(44px,8vw,92px)] text-bone">
              Wear The<br /><span className="text-volt">Streets.</span>
            </h1>
            <p className="mb-7 mt-4 max-w-[440px] text-[16px] text-muted">
              Streetwear original buatan lokal. Bahan premium, potongan bold, ukuran lengkap dari S sampai XL. Sekali pakai, susah lepas.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="rounded-full bg-volt px-7 py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">Belanja Sekarang</Link>
              <Link href="/products?new=1" className="rounded-full border border-line px-7 py-3 font-extrabold uppercase tracking-wide text-bone transition hover:border-volt hover:text-volt">New Arrival</Link>
            </div>
            <div className="mt-9 flex gap-8">
              {[["5K+", "Order terkirim"], ["4.9★", "Rating toko"], ["3", "Store offline"]].map(([b, s]) => (
                <div key={s}><b className="disp block text-[28px] text-bone">{b}</b><small className="text-[12px] uppercase tracking-wide text-muted">{s}</small></div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-surface2 to-bg text-[90px]">
                <span className="absolute left-4 top-4 rounded-full bg-volt px-3 py-1 text-[12px] font-extrabold uppercase text-bg">Best Seller</span>
                🧥
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted">Hoodie</div>
                  <div className="font-bold text-bone">Hoodie &lsquo;Shadow&rsquo;</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-bone">{rupiah(329000)}</div>
                  <div className="text-xs text-muted line-through">{rupiah(399000)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE TICKER STRIP */}
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-3 text-[12.5px] font-bold uppercase tracking-widest text-bone">
          {features.map(([i, t]) => (
            <span key={t} className="inline-flex items-center gap-2"><span className="text-volt">{i}</span>{t}</span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5">
        {/* KATEGORI */}
        <SecHead title="Belanja per Kategori" sub="Pilih kategori, langsung gas" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {cats.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="group relative flex aspect-[5/4] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl2 border border-line bg-surface transition hover:border-volt/60 hover:shadow-card">
              <span className="text-4xl transition group-hover:scale-110">{c.emoji}</span>
              <span className="text-[13px] font-extrabold uppercase tracking-wide text-bone group-hover:text-volt">{c.name}</span>
            </Link>
          ))}
        </div>

        {/* BEST SELLERS */}
        <SecHead title="Best Seller 🔥" sub="Yang paling banyak diburu" href="/products" />
        <Grid items={best} />

        {/* WHY BAND */}
        <div className="relative my-10 overflow-hidden rounded-2xl border border-volt/30 bg-surface px-6 py-10 md:px-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-volt/10 blur-2xl" />
          <h2 className="disp relative mb-2 max-w-[600px] text-[clamp(26px,4vw,40px)] text-bone">
            Bukan sekadar baju. <span className="text-volt">Ini statement.</span>
          </h2>
          <p className="relative mb-7 max-w-[560px] text-muted">Setiap potong kami garap dari bahan pilihan dengan QC ketat. Nyaman dipakai, awet, dan bikin tampil beda.</p>
          <div className="relative grid gap-6 md:grid-cols-3">
            {[["01", "Bahan Premium", "Cotton combed, fleece tebal, denim berkualitas — bukan abal-abal."],
              ["02", "Ukuran Lengkap", "S sampai XL dengan size chart jelas. Tukar ukuran gratis 7 hari."],
              ["03", "Original Lokal", "Desain orisinal, produksi dalam negeri, mendukung brand lokal."]].map(([n, h, p]) => (
              <div key={n}>
                <b className="disp block text-[34px] text-volt">{n}</b>
                <h4 className="mb-1 mt-2 text-base font-extrabold uppercase tracking-wide text-bone">{h}</h4>
                <p className="text-[13.5px] text-muted">{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NEW ARRIVAL */}
        <SecHead title="New Arrival ✦" sub="Koleksi terbaru yang baru turun" href="/products?new=1" linkText="Lihat semua →" />
        <Grid items={fresh} />

        <SecHead title="Kata Mereka" sub="Lebih dari 5.000 order terkirim" />
      </div>

      {/* REVIEWS MARQUEE */}
      <div className="my-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-3.5">
          {[...reviews, ...reviews].map(([n, c, t], i) => (
            <div key={i} className="w-[290px] flex-none rounded-xl2 border border-line bg-surface p-4">
              <div className="mb-1.5 text-[13px] text-volt">★★★★★</div>
              <p className="mb-3 text-[13.5px] text-bone">&ldquo;{t}&rdquo;</p>
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-volt text-[13px] font-extrabold text-bg">{n[0]}</div>
                <div><b className="text-[13px] text-bone">{n}</b><small className="block text-[11.5px] text-muted">{c}</small></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STORES */}
      <div className="mx-auto max-w-[1200px] px-5">
        <SecHead title="Mampir ke Store" sub="Coba langsung ukurannya di toko offline" />
        <div className="grid gap-4 md:grid-cols-3">
          {stores.map(([n, a, h]) => (
            <div key={n} className="overflow-hidden rounded-xl2 border border-line bg-surface">
              <div className="grid aspect-video place-items-center bg-gradient-to-br from-surface2 to-bg text-3xl">📍</div>
              <div className="p-4">
                <h4 className="mb-1 font-extrabold uppercase tracking-wide text-bone">{n}</h4>
                <small className="block text-[13px] text-muted">{a}</small>
                <div className="mt-2 text-[12.5px] font-bold text-volt">{h}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Grid({ items }: { items: Awaited<ReturnType<typeof getProducts>> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} p={toCard(p)} />)}
    </div>
  );
}

function SecHead({ title, sub, href, linkText = "Lihat semua →" }: {
  title: string; sub: string; href?: string; linkText?: string;
}) {
  return (
    <div className="mb-5 mt-12 flex items-end justify-between gap-4">
      <div>
        <h2 className="disp text-[clamp(26px,4vw,38px)] text-bone">{title}</h2>
        <p className="mt-1 text-[14px] text-muted">{sub}</p>
      </div>
      {href && <Link href={href} className="whitespace-nowrap text-[13px] font-extrabold uppercase tracking-wide text-volt">{linkText}</Link>}
    </div>
  );
}
