import Link from "next/link";
import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-bone outline-none transition focus:border-volt placeholder:text-muted";
export const labelCls = "mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-muted";

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="disp text-3xl text-bone">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="rounded-full bg-volt px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">
      {children}
    </Link>
  );
}

export function StatCard({ label, value, icon, accent }: { label: string; value: string; icon?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 transition hover:border-volt/40">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] uppercase tracking-wide text-muted">{label}</span>
        {icon && (
          <span className={`grid h-8 w-8 place-items-center rounded-lg text-base ${accent ? "bg-volt/15 text-volt" : "bg-surface2 text-muted"}`}>{icon}</span>
        )}
      </div>
      <div className="disp mt-2 text-3xl text-bone">{value}</div>
    </div>
  );
}

const TONE: Record<string, string> = {
  green: "bg-emerald-500/12 text-emerald-500",
  amber: "bg-amber-500/15 text-amber-500",
  red: "bg-red-500/12 text-red-500",
  volt: "bg-volt/15 text-volt",
  gray: "bg-surface2 text-muted",
};

export function Badge({ tone = "gray", dot, children }: { tone?: keyof typeof TONE; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${TONE[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function SectionCard({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="mb-4">
        <h2 className="font-extrabold uppercase tracking-wide text-bone">{title}</h2>
        {desc && <p className="mt-0.5 text-[13px] text-muted">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-muted">{hint}</p>}
    </div>
  );
}
