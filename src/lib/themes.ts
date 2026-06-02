export type ThemeMeta = {
  id: string;
  name: string;
  desc: string;
  swatch: string[]; // [bg, accent, text] untuk preview
  fontNote: string;
};

export const THEMES: ThemeMeta[] = [
  {
    id: "streetwear",
    name: "Streetwear",
    desc: "Gelap, bold, aksen volt/lime — gaya distro.",
    swatch: ["#0c0c0e", "#c6ff3a", "#f4f2ec"],
    fontNote: "Anton + Archivo",
  },
  {
    id: "clean",
    name: "Clean (ala Maujual)",
    desc: "Terang, bersih, aksen teal — gaya toko gadget.",
    swatch: ["#ffffff", "#0a7d6e", "#0c1a17"],
    fontNote: "Sora + Plus Jakarta",
  },
];

export const DEFAULT_THEME = "streetwear";

export const isValidTheme = (id: string) => THEMES.some((t) => t.id === id);
