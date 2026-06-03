"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const isAdmin = (p: string | null) => !!p && p.startsWith("/admin");

export function StoreHeader() {
  const pathname = usePathname();
  if (isAdmin(pathname)) return null;
  return <Header />;
}

export function StoreFooter() {
  const pathname = usePathname();
  if (isAdmin(pathname)) return null;
  return (
    <>
      <Footer />
      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        className="fixed right-4 bottom-4 z-[60] grid h-14 w-14 animate-bob place-items-center rounded-full bg-volt text-2xl text-bg shadow-volt"
        title="Chat WhatsApp"
      >
        💬
      </a>
    </>
  );
}
