import { THEMES } from "@/lib/themes";
import { getActiveTheme } from "@/lib/settings";
import { setTheme } from "../../actions";

export const dynamic = "force-dynamic";

export default async function Appearance() {
  const active = await getActiveTheme();

  return (
    <div>
      <h1 className="disp mb-2 text-3xl text-bone">Tampilan</h1>
      <p className="mb-7 text-sm text-muted">Pilih template untuk seluruh toko. Perubahan langsung berlaku ke semua pengunjung.</p>

      <div className="grid gap-5 sm:grid-cols-2">
        {THEMES.map((t) => {
          const isActive = t.id === active;
          return (
            <div key={t.id} className={`overflow-hidden rounded-xl2 border bg-surface ${isActive ? "border-volt" : "border-line"}`}>
              {/* preview swatch */}
              <div className="flex h-28" style={{ background: t.swatch[0] }}>
                <div className="flex flex-1 flex-col justify-center gap-1.5 p-4">
                  <div className="h-3 w-24 rounded" style={{ background: t.swatch[2] }} />
                  <div className="h-2 w-32 rounded opacity-50" style={{ background: t.swatch[2] }} />
                  <div className="mt-1 h-6 w-20 rounded-full" style={{ background: t.swatch[1] }} />
                </div>
                <div className="flex w-16 items-center justify-center">
                  <div className="h-12 w-12 rounded-lg" style={{ background: t.swatch[1] }} />
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold uppercase tracking-wide text-bone">{t.name}</h3>
                  {isActive && <span className="rounded-full bg-volt/15 px-2 py-0.5 text-[11px] font-bold text-volt">Aktif</span>}
                </div>
                <p className="mt-1 text-[13px] text-muted">{t.desc}</p>
                <p className="mt-1 text-[12px] text-muted">Font: {t.fontNote}</p>

                {!isActive && (
                  <form action={setTheme.bind(null, t.id)} className="mt-4">
                    <button className="rounded-full bg-volt px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">
                      Aktifkan
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[12px] text-muted">
        Ingin menambah template lain? Tambahkan entri di <span className="font-mono">src/lib/themes.ts</span> dan blok <span className="font-mono">[data-theme=&quot;…&quot;]</span> di <span className="font-mono">globals.css</span>.
      </p>
    </div>
  );
}
