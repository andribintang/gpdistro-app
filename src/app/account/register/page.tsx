import Link from "next/link";
import { redirect } from "next/navigation";
import { registerUser } from "../actions";
import { getCurrentUser } from "@/lib/auth-customer";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  if (await getCurrentUser()) redirect("/account");

  const input = "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-bone outline-none placeholder:text-muted focus:border-volt";

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="disp mb-1 text-3xl text-bone">Daftar</h1>
      <p className="mb-6 text-sm text-muted">Sudah punya akun? <Link href="/account/login" className="font-bold text-volt">Masuk</Link></p>

      <form action={registerUser} className="grid gap-3">
        <input className={input} name="name" placeholder="Nama lengkap" autoFocus />
        <input className={input} name="email" type="email" placeholder="Email" />
        <input className={input} name="password" type="password" placeholder="Password (min. 6 karakter)" />
        {searchParams.error && <p className="text-sm text-volt">{searchParams.error}</p>}
        <button className="rounded-full bg-volt py-3 font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">Buat Akun</button>
      </form>
    </div>
  );
}
