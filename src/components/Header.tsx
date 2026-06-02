"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";

const cats = [
  { label: "Semua", href: "/products" },
  { label: "Kaos", href: "/products?category=kaos" },
  { label: "Kemeja", href: "/products?category=kemeja" },
  { label: "Hoodie & Jaket", href: "/products?category=hoodie-jaket" },
  { label: "Celana", href: "/products?category=celana" },
  { label: "Topi & Aksesoris", href: "/products?category=aksesoris" },
  { label: "New Arrival", href: "/products?new=1" },
  { label: "Sale", href: "/products?sale=1" },
];

const tickerText = "FREE ONGKIR MIN. 250RB  ✦  TUKAR UKURAN 7 HARI  ✦  100% ORIGINAL  ✦  NEW DROP SETIAP JUMAT  ✦  ";

export default function Header() {
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* TICKER */}
      <div className="overflow-hidden border-b border-line bg-volt text-bg">
        <div className="flex w-max animate-ticker whitespace-nowrap py-1.5 text-[12px] font-extrabold tracking-wide">
          <span>{tickerText.repeat(2)}</span>
          <span>{tickerText.repeat(2)}</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center gap-4 px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="disp text-2xl tracking-tight text-bone">
              GP<span className="text-volt">DISTRO</span>
            </span>
          </Link>

          <label className="ml-2 hidden flex-1 max-w-[380px] items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 text-[14px] text-muted md:flex">
            🔍
            <input className="flex-1 bg-transparent text-bone outline-none placeholder:text-muted" placeholder="Cari kaos, hoodie, cargo…" />
          </label>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/account" className="grid h-[42px] w-[42px] place-items-center rounded-full border border-line bg-surface hover:border-volt hover:text-volt" title="Akun saya">👤</Link>
            <Link href="/cart" className="relative grid h-[42px] w-[42px] place-items-center rounded-full border border-line bg-surface hover:border-volt hover:text-volt" title="Keranjang">
              🛒
              {mounted && count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-volt px-1 text-[11px] font-extrabold text-bg">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav className="border-t border-line">
          <div className="no-scrollbar mx-auto flex h-[46px] max-w-[1200px] items-center gap-1 overflow-x-auto px-5">
            {cats.map((c) => (
              <Link key={c.label} href={c.href} className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-bold uppercase tracking-wide text-muted transition hover:bg-surface2 hover:text-bone">
                {c.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
    </>
  );
}
