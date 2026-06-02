import Link from "next/link";
import { getProducts, getCategories, toCard } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; new?: string; sale?: string };
}) {
  const { category, new: isNew, sale } = searchParams;

  const [all, cats] = await Promise.all([
    getProducts({ category, isNew: isNew === "1" || undefined }),
    getCategories(),
  ]);

  // filter "sale" di memori (produk yang punya harga coret)
  const products = sale === "1" ? all.filter((p) => p.oldPrice && p.oldPrice > p.basePrice) : all;

  const heading = sale === "1" ? "Sale 🔥"
    : isNew === "1" ? "New Arrival ✦"
    : category ? cats.find((c) => c.slug === category)?.name ?? "Produk"
    : "Semua Produk";

  const chip = (label: string, href: string, active: boolean) => (
    <Link key={label} href={href}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-bold uppercase tracking-wide transition ${
        active ? "border-volt bg-volt text-bg" : "border-line text-muted hover:border-volt hover:text-bone"
      }`}>
      {label}
    </Link>
  );

  const base = (s?: string) => !category && !isNew && !sale && !s;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8">
      <nav className="mb-2 text-[12.5px] uppercase tracking-wide text-muted">
        <Link href="/" className="hover:text-volt">Home</Link> / <span className="text-bone">{heading}</span>
      </nav>
      <h1 className="disp mb-1 text-[clamp(30px,5vw,52px)] text-bone">{heading}</h1>
      <p className="mb-6 text-[14px] text-muted">{products.length} produk · tukar ukuran gratis 7 hari</p>

      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
        {chip("Semua", "/products", base())}
        {chip("New", "/products?new=1", isNew === "1")}
        {chip("Sale", "/products?sale=1", sale === "1")}
        {cats.map((c) => chip(c.name, `/products?category=${c.slug}`, category === c.slug))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl2 border border-line bg-surface py-20 text-center text-muted">
          Belum ada produk untuk filter ini.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={toCard(p)} />)}
        </div>
      )}
    </div>
  );
}
