import Link from "next/link";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/products", label: "Produk", icon: "👕" },
  { href: "/admin/orders", label: "Pesanan", icon: "🧾" },
  { href: "/admin/customers", label: "Pelanggan", icon: "👥" },
  { href: "/admin/appearance", label: "Tampilan", icon: "🎨" },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-bone">
      <div className="mx-auto flex max-w-[1280px] gap-0">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 flex-none flex-col border-r border-line bg-surface p-5 md:flex">
          <Link href="/admin" className="disp mb-8 text-2xl text-bone">GP<span className="text-volt">DISTRO</span></Link>
          <nav className="grid gap-1">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-muted transition hover:bg-surface2 hover:text-bone">
                <span>{n.icon}</span> {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-2 border-t border-line pt-4">
            <Link href="/" className="rounded-lg px-3 py-2 text-[13px] font-semibold text-muted hover:text-volt">↗ Lihat toko</Link>
            <form action={logout}>
              <button className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-muted hover:text-volt">⏻ Keluar</button>
            </form>
          </div>
        </aside>

        {/* main */}
        <div className="flex-1">
          {/* topbar mobile */}
          <div className="flex items-center justify-between border-b border-line bg-surface px-5 py-3 md:hidden">
            <Link href="/admin" className="disp text-xl text-bone">GP<span className="text-volt">DISTRO</span></Link>
            <div className="flex gap-3 text-sm">
              {nav.map((n) => <Link key={n.href} href={n.href} className="text-muted hover:text-volt">{n.label}</Link>)}
              <form action={logout}><button className="text-muted hover:text-volt">Keluar</button></form>
            </div>
          </div>

          <div className="p-5 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
