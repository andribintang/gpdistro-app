"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  key: string;      // `${id}__${size}` — unik per produk+ukuran
  id: string;       // product id
  slug: string;
  name: string;
  size: string;
  price: number;
  emoji: string;
  image?: string | null;
  category: string;
  quantity: number;
};

type AddInput = Omit<CartItem, "key" | "quantity">;

type CartState = {
  items: CartItem[];
  add: (item: AddInput, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
};

const makeKey = (id: string, size: string) => `${id}__${size}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const key = makeKey(item.id, item.size);
          const found = s.items.find((i) => i.key === key);
          if (found) {
            return {
              items: s.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, key, quantity: qty }] };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.key === key ? { ...i, quantity: Math.max(1, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      total: () => get().items.reduce((n, i) => n + i.price * i.quantity, 0),
    }),
    { name: "gpdistro-cart" }
  )
);
