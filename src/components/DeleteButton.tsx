"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/admin/actions";

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus / nonaktifkan "${name}"?`)) start(() => deleteProduct(id));
      }}
      className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-muted transition hover:border-volt hover:text-volt disabled:opacity-50"
    >
      {pending ? "…" : "Hapus"}
    </button>
  );
}
