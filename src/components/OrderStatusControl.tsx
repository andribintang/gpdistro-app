"use client";

import { useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DONE", "CANCELLED"];

export default function OrderStatusControl({ id, current }: { id: string; current: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      disabled={pending}
      value={current}
      onChange={(e) => start(() => setOrderStatus(id, e.target.value))}
      className="rounded-lg border border-line bg-bg px-3 py-1.5 text-[12px] font-bold text-bone outline-none focus:border-volt disabled:opacity-50"
    >
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
