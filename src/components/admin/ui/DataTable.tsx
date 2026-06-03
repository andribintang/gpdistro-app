"use client";

import { useMemo, useState, type ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  width?: string;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

export default function DataTable<T>({
  columns,
  rows,
  getRowId,
  searchValue,
  searchPlaceholder = "Cari…",
  filters,
  pageSize = 8,
  initialSort = null,
  emptyMessage = "Tidak ada data.",
  selectable = false,
  bulkActions,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  searchValue?: (row: T) => string;
  searchPlaceholder?: string;
  filters?: ReactNode;
  pageSize?: number;
  initialSort?: SortState;
  emptyMessage?: string;
  selectable?: boolean;
  bulkActions?: (selectedIds: string[], clear: () => void) => ReactNode;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortState>(initialSort);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!searchValue || !q.trim()) return rows;
    const t = q.toLowerCase();
    return rows.filter((r) => searchValue(r).toLowerCase().includes(t));
  }, [rows, q, searchValue]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a), bv = col.sortValue!(b);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sort, columns]);

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const toggleSort = (key: string) => {
    setPage(1);
    setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" }));
  };

  const allIds = sorted.map(getRowId);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(allIds));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const clearSel = () => setSelected(new Set());
  const colSpan = columns.length + (selectable ? 1 : 0);

  const alignCls = (a?: string) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left");

  return (
    <div>
      {/* toolbar */}
      {(searchValue || filters) && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {searchValue && (
            <div className="relative min-w-[220px] flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">🔍</span>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-line bg-bg py-2.5 pl-10 pr-3.5 text-sm text-bone outline-none transition focus:border-volt"
              />
            </div>
          )}
          {filters}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {selectable && bulkActions && selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-line bg-volt/8 px-4 py-2.5">
            <span className="text-[12.5px] font-bold text-bone">{selected.size} dipilih</span>
            {bulkActions([...selected], clearSel)}
            <button onClick={clearSel} className="ml-auto text-[12.5px] font-bold text-muted hover:text-volt">Batal pilih</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface2 text-[11px] uppercase tracking-wider text-muted">
                {selectable && (
                  <th className="w-10 px-4 py-3.5">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-volt" title="Pilih semua" />
                  </th>
                )}
                {columns.map((c) => (
                  <th key={c.key} className={`px-4 py-3.5 font-semibold ${alignCls(c.align)}`} style={c.width ? { width: c.width } : undefined}>
                    {c.sortable ? (
                      <button
                        onClick={() => toggleSort(c.key)}
                        className={`inline-flex items-center gap-1 transition hover:text-bone ${sort?.key === c.key ? "text-bone" : ""}`}
                      >
                        {c.header}
                        <span className="text-[10px]">{sort?.key === c.key ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}</span>
                      </button>
                    ) : c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const id = getRowId(row);
                return (
                  <tr key={id} className={`group border-b border-line/60 transition-colors last:border-0 hover:bg-surface2/60 ${selected.has(id) ? "bg-volt/5" : ""}`}>
                    {selectable && (
                      <td className="px-4 py-3.5 align-middle">
                        <input type="checkbox" checked={selected.has(id)} onChange={() => toggleOne(id)} className="h-4 w-4 accent-volt" />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3.5 align-middle ${alignCls(c.align)}`}>
                        {c.render ? c.render(row) : (row as any)[c.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {total === 0 && <div className="py-16 text-center text-muted">{emptyMessage}</div>}

        {/* pagination */}
        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            <span className="text-[12.5px] text-muted">
              Menampilkan {start + 1}–{Math.min(start + pageSize, total)} dari {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={cur <= 1}
                className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-bold text-bone transition hover:border-volt disabled:opacity-40"
              >← Prev</button>
              <span className="px-3 text-[12.5px] text-muted">Hal {cur}/{pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={cur >= pages}
                className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-bold text-bone transition hover:border-volt disabled:opacity-40"
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
