import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/lib/types";

type WithRelations = Awaited<ReturnType<typeof getProducts>>[number];

export function toCard(p: WithRelations): ProductCardData {
  const images = p.images
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((im) => im.url);
  return {
    id: p.id, slug: p.slug, name: p.name, emoji: p.emoji,
    image: images[0] ?? null, images,
    basePrice: p.basePrice, oldPrice: p.oldPrice,
    material: p.material, fit: p.fit,
    categoryName: p.category.name,
    sizes: p.sizes
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ label: s.label, stock: s.stock })),
    isNew: p.isNew, isBestSeller: p.isBestSeller,
  };
}

export async function getProducts(opts: {
  category?: string;
  bestSeller?: boolean;
  isNew?: boolean;
  take?: number;
} = {}) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(opts.category ? { category: { slug: opts.category } } : {}),
      ...(opts.bestSeller ? { isBestSeller: true } : {}),
      ...(opts.isNew ? { isNew: true } : {}),
    },
    include: { category: true, sizes: true, images: true },
    orderBy: { createdAt: "asc" },
    ...(opts.take ? { take: opts.take } : {}),
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true, sizes: true, images: true },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}
