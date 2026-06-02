import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, toCard } from "@/lib/products";
import { rupiah, discountPct } from "@/lib/format";
import BuyBox from "@/components/BuyBox";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p || !p.isActive) notFound();

  const card = toCard(p);
  const pct = discountPct(p.basePrice, p.oldPrice);
  const related = (await getProducts({ category: p.category.slug, take: 5 }))
    .filter((r) => r.id !== p.id)
    .slice(0, 4);

  const specs: [string, string][] = [
    ["Kategori", p.category.name],
    ["Bahan", p.material],
    ["Fit", p.fit],
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8">
      <nav className="mb-5 text-[12.5px] uppercase tracking-wide text-muted">
        <Link href="/" className="hover:text-volt">Home</Link> /{" "}
        <Link href={`/products?category=${p.category.slug}`} className="hover:text-volt">{p.category.name}</Link> /{" "}
        <span className="text-bone">{p.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery images={card.images} emoji={p.emoji} name={p.name} badge={pct > 0 ? `-${pct}%` : null} />

        <div>
          <span className="text-[12px] font-bold uppercase tracking-widest text-muted">{p.category.name}</span>
          <h1 className="disp mb-3 mt-1 text-[clamp(28px,4.5vw,44px)] text-bone">{p.name}</h1>

          <div className="mb-5 flex items-baseline gap-3">
            <span className="font-sans text-[30px] font-extrabold text-bone">{rupiah(p.basePrice)}</span>
            {p.oldPrice && <span className="text-base font-semibold text-muted line-through">{rupiah(p.oldPrice)}</span>}
          </div>

          <p className="mb-6 text-[15px] leading-relaxed text-muted">{p.description}</p>

          <div className="mb-6 grid grid-cols-3 gap-3">
            {specs.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-surface p-3">
                <div className="text-[11px] uppercase tracking-wide text-muted">{k}</div>
                <div className="mt-0.5 text-sm font-bold text-bone">{v}</div>
              </div>
            ))}
          </div>

          <BuyBox p={card} />

          <div className="mt-6 flex flex-wrap gap-4 text-[12.5px] uppercase tracking-wide text-muted">
            <span className="text-volt">✦</span> Tukar ukuran 7 hari
            <span className="text-volt">✦</span> 100% original
            <span className="text-volt">✦</span> Kirim cepat
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <h2 className="disp mb-5 mt-14 text-[clamp(24px,4vw,34px)] text-bone">Lengkapi Look-mu</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={toCard(r)} />)}
          </div>
        </>
      )}
    </div>
  );
}
