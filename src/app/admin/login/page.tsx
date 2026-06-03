import { login } from "../actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLogin({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-bg px-5">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgb(var(--c-volt)) 0, transparent 45%)" }} />
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-card">
        <Link href="/" className="disp mb-1 block text-center text-3xl text-bone">GP<span className="text-volt">DISTRO</span></Link>
        <p className="mb-7 text-center text-[11px] font-bold uppercase tracking-widest text-muted">Panel Admin</p>

        <form action={login} className="grid gap-3">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-muted">Password</label>
            <input
              name="password" type="password" placeholder="••••••••" autoFocus
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-bone outline-none transition focus:border-volt placeholder:text-muted"
            />
          </div>
          {searchParams.error && <p className="text-sm text-volt">Password salah, coba lagi.</p>}
          <button className="mt-1 rounded-full bg-volt py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">Masuk</button>
        </form>

        <p className="mt-6 text-center text-[11.5px] text-muted">
          Default: <span className="font-mono text-bone">admin123</span> — ubah di <span className="font-mono">.env</span>
        </p>
      </div>
    </div>
  );
}
