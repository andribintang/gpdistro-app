import type { Metadata } from "next";
import { Archivo, Anton, Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { StoreHeader, StoreFooter } from "@/components/StoreChrome";
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
        <StoreHeader />
        <main>{children}</main>
        <StoreFooter />
      </body>
    </html>
  );
}
