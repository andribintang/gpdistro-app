"use client";

import Link from "next/link";
import { rupiah } from "@/lib/format";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";

export type AdminCustomerRow = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string; // ISO
};

export default function CustomersTable({ customers }: { customers: AdminCustomerRow[] }) {
  const columns: Column<AdminCustomerRow>[] = [
    {
      key: "name", header: "Pelanggan", sortable: true, sortValue: (c) => c.name.toLowerCase(),
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-volt/15 text-sm font-extrabold text-volt">
            {c.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="truncate font-semibold text-bone">{c.name}</div>
            <div className="truncate text-[12px] text-muted">{c.email}</div>
          </div>
        </div>
      ),
    },
    { key: "orders", header: "Pesanan", align: "center", sortable: true, sortValue: (c) => c.orders, render: (c) => <span className="font-semibold text-bone">{c.orders}</span> },
    { key: "spent", header: "Total belanja", sortable: true, sortValue: (c) => c.spent, render: (c) => <span className="font-semibold text-bone">{rupiah(c.spent)}</span> },
    { key: "joined", header: "Bergabung", sortable: true, sortValue: (c) => c.joined, render: (c) => <span className="text-muted">{new Date(c.joined).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span> },
    {
      key: "actions", header: "Aksi", align: "right",
      render: (c) => <Link href={`/admin/customers/${c.id}`} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-bone hover:border-volt hover:text-volt">Detail</Link>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={customers}
      getRowId={(c) => c.id}
      searchValue={(c) => `${c.name} ${c.email}`}
      searchPlaceholder="Cari nama / email…"
      initialSort={{ key: "spent", dir: "desc" }}
      pageSize={10}
      emptyMessage="Belum ada pelanggan terdaftar."
    />
  );
}
