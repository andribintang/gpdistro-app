import { login } from "../actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLogin({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8">
        <Link href="/" className="disp mb-1 block text-center text-3xl text-bone">GP<span className="text-volt">DISTRO</span></Link>
        <p className="mb-6 text-center text-[13px] uppercase tracking-widest text-muted">Admin Panel</p>

        <form action={login} className="grid gap-3">
          <input
            name="password"
            type="password"
            placeholder="Password admin"
            autoFocus
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-bone outline-none placeholder:text-muted focus:border-volt"
          />
          {searchParams.error && <p className="text-sm text-volt">Password salah, coba lagi.</p>}
          <button className="rounded-full bg-volt py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">
            Masuk
          </button>
        </form>

        <p className="mt-5 text-center text-[11.5px] text-muted">
          Default password: <span className="font-mono text-bone">admin123</span><br />(ubah di file .env)
        </p>
      </div>
    </div>
  );
}
