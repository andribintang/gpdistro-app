"use client";

import { useState } from "react";
import Link from "next/link";
import { rupiah } from "@/lib/format";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import { Badge } from "@/components/admin/ui/kit";

export type AdminOrderRow = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  createdAt: string;       // ISO
  itemsCount: number;
  itemsSummary: string;
  total: number;
  status: string;
};

const STATUS_TONE: Record<string, string> = {
  PENDING: "amber", PAID: "green", SHIPPED: "volt", DONE: "green", CANCELLED: "red",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu", PAID: "Dibayar", SHIPPED: "Dikirim", DONE: "Selesai", CANCELLED: "Batal",
};

export default function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  const [status, setStatus] = useState("");
  const rows = status ? orders.filter((o) => o.status === status) : orders;

  const columns: Column<AdminOrderRow>[] = [
    {
      key: "id", header: "Order",
      render: (o) => (
        <div>
          <div className="font-mono text-[12px] text-muted">#{o.id.slice(-8)}</div>
          <div className="text-[12px] text-muted">{new Date(o.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</div>
        </div>
      ),
    },
    {
      key: "customer", header: "Pelanggan", sortable: true, sortValue: (o) => o.customer.toLowerCase(),
      render: (o) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-bone">{o.customer}</div>
          <div className="truncate text-[12px] text-muted">{o.itemsCount} item · {o.itemsSummary}</div>
        </div>
      ),
    },
    {
      key: "total", header: "Total", sortable: true, sortValue: (o) => o.total,
      render: (o) => <span className="font-semibold text-bone">{rupiah(o.total)}</span>,
    },
    {
      key: "statusBadge", header: "Status", sortable: true, sortValue: (o) => o.status,
      render: (o) => <Badge tone={(STATUS_TONE[o.status] ?? "gray") as any} dot>{STATUS_LABEL[o.status] ?? o.status}</Badge>,
    },
    {
      key: "actions", header: "Aksi", align: "right",
      render: (o) => (
        <Link href={`/admin/orders/${o.id}`} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-bone hover:border-volt hover:text-volt">Kelola</Link>
      ),
    },
  ];

  const filters = (
    <select value={status} onChange={(e) => setStatus(e.target.value)}
      className="rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-bone outline-none focus:border-volt">
      <option value="">Semua status</option>
      {Object.keys(STATUS_LABEL).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
    </select>
  );

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(o) => o.id}
      searchValue={(o) => `${o.customer} ${o.email} ${o.id} ${o.phone}`}
      searchPlaceholder="Cari pelanggan / no. order…"
      filters={filters}
      pageSize={8}
      emptyMessage="Belum ada pesanan."
    />
  );
}
