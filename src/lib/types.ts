export type SizeOption = { label: string; stock: number };

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  image: string | null;   // foto utama (null = pakai emoji)
  images: string[];        // galeri lengkap
  basePrice: number;
  oldPrice: number | null;
  material: string;
  fit: string;
  categoryName: string;
  sizes: SizeOption[];
  isNew: boolean;
  isBestSeller: boolean;
};

export const totalStock = (sizes: SizeOption[]) =>
  sizes.reduce((n, s) => n + s.stock, 0);
