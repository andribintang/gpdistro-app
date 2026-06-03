"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/admin/actions";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "▦", exact: true },
  { href: "/admin/products", label: "Produk", icon: "👕" },
  { href: "/admin/orders", label: "Pesanan", icon: "🧾" },
  { href: "/admin/customers", label: "Pelanggan", icon: "👥" },
  { href: "/admin/appearance", label: "Tampilan", icon: "🎨" },
];

function titleFor(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/products/new")) return "Produk Baru";
  if (pathname.startsWith("/admin/products/")) return "Edit Produk";
  if (pathname.startsWith("/admin/products")) return "Produk";
  if (pathname.startsWith("/admin/orders")) return "Pesanan";
  if (pathname.startsWith("/admin/customers/")) return "Detail Pelanggan";
  if (pathname.startsWith("/admin/customers")) return "Pelanggan";
  if (pathname.startsWith("/admin/appearance")) return "Tampilan";
  return "Admin";
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false); // drawer mobile
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem("gp_admin_collapsed") === "1"); } catch {}
    setReady(true);
  }, []);

  const toggleCollapse = () =>
    setCollapsed((c) => {
      const n = !c;
      try { localStorage.setItem("gp_admin_collapsed", n ? "1" : "0"); } catch {}
      return n;
    });

  const isActive = (item: (typeof nav)[number]) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  /* daftar menu — `mini` = mode collapse (ikon saja) */
  const NavLinks = ({ mini, onNavigate }: { mini?: boolean; onNavigate?: () => void }) => (
    <nav className="grid gap-1">
      {!mini && <div className="mb-1 px-3 text-[10.5px] font-bold uppercase tracking-widest text-muted">Menu</div>}
      {nav.map((n) => {
        const active = isActive(n);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            title={mini ? n.label : undefined}
            className={`relative flex items-center rounded-xl text-sm font-bold transition ${
              mini ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
            } ${active ? "bg-volt/12 text-volt" : "text-muted hover:bg-surface2 hover:text-bone"}`}
          >
            {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-volt" />}
            <span className="text-base">{n.icon}</span>
            {!mini && n.label}
          </Link>
        );
      })}
    </nav>
  );

  const Bottom = ({ mini }: { mini?: boolean }) => (
    <div className="mt-auto grid gap-2 border-t border-line pt-4">
      <Link href="/" title="Lihat toko" className={`flex items-center rounded-xl py-2 text-[13px] font-semibold text-muted transition hover:text-volt ${mini ? "justify-center px-0" : "gap-2 px-3"}`}>
        <span>↗</span>{!mini && "Lihat toko"}
      </Link>
      <form action={logout}>
        <button title="Keluar" className={`flex w-full items-center rounded-xl py-2 text-[13px] font-semibold text-muted transition hover:text-volt ${mini ? "justify-center px-0" : "gap-2 px-3 text-left"}`}>
          <span>⏻</span>{!mini && "Keluar"}
        </button>
      </form>
    </div>
  );

  const Brand = ({ mini }: { mini?: boolean }) => (
    <Link href="/admin" className="disp block text-2xl text-bone">
      {mini ? <span>GP</span> : <>GP<span className="text-volt">DISTRO</span></>}
    </Link>
  );

  return (
    <div className="min-h-screen bg-bg text-bone">
      <div className="flex">
        {/* SIDEBAR DESKTOP */}
        <aside
          className={`sticky top-0 hidden h-screen flex-none flex-col border-r border-line bg-surface p-4 transition-[width] duration-200 ease-out md:flex ${
            ready && collapsed ? "w-[76px] items-center" : "w-64"
          }`}
        >
          <div className={`mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
            <Brand mini={ready && collapsed} />
            {!collapsed && (
              <button onClick={toggleCollapse} title="Ciutkan menu" className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:border-volt hover:text-volt">‹</button>
            )}
          </div>
          {collapsed && (
            <button onClick={toggleCollapse} title="Lebarkan menu" className="mb-3 grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:border-volt hover:text-volt">›</button>
          )}
          <div className="w-full flex-1 overflow-y-auto">
            <NavLinks mini={ready && collapsed} />
          </div>
          <div className="w-full"><Bottom mini={ready && collapsed} /></div>
        </aside>

        {/* KONTEN */}
        <div className="min-w-0 flex-1">
          {/* HEADER ADMIN STATIS */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3.5 md:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-bone transition hover:border-volt md:hidden">☰</button>
              <button onClick={toggleCollapse} title="Ciutkan / lebarkan menu" className="hidden h-9 w-9 place-items-center rounded-lg border border-line text-bone transition hover:border-volt md:grid">≡</button>
              <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">
                Admin <span className="text-volt">/</span> {titleFor(pathname)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="rounded-full border border-line px-4 py-2 text-[12.5px] font-bold text-bone transition hover:border-volt hover:text-volt">↗ Lihat toko</Link>
              <form action={logout}>
                <button className="rounded-full bg-volt px-4 py-2 text-[12.5px] font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">Keluar</button>
              </form>
            </div>
          </header>

          <div className="p-5 md:p-8">{children}</div>
        </div>
      </div>

      {/* DRAWER MOBILE */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-line bg-surface p-4">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} className="text-muted">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto"><NavLinks onNavigate={() => setOpen(false)} /></div>
            <Bottom />
          </aside>
        </div>
      )}
    </div>
  );
}
