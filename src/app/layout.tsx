import type { Metadata } from "next";
import { Archivo, Anton, Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getActiveTheme } from "@/lib/settings";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: "GPDISTRO — Streetwear & Apparel",
  description:
    "Distro streetwear original. Kaos, kemeja, hoodie, celana, dan aksesoris dengan bahan premium. Ukuran lengkap, tukar ukuran 7 hari.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme();
  const fontVars = `${archivo.variable} ${anton.variable} ${sora.variable} ${jakarta.variable}`;

  return (
    <html lang="id" data-theme={theme} className={fontVars}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          className="fixed right-4 bottom-4 z-[60] grid h-14 w-14 animate-bob place-items-center rounded-full bg-volt text-2xl text-bg shadow-volt"
          title="Chat WhatsApp"
        >
          💬
        </a>
      </body>
    </html>
  );
}
