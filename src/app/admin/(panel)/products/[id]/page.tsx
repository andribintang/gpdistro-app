import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/products";
import { updateProduct, type ProductInput } from "@/app/admin/actions";
import ProductForm from "@/components/ProductForm";
import { PageHeader } from "@/components/admin/ui/kit";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { sizes: true, images: true } }),
    getCategories(),
  ]);
  if (!product) notFound();

  const initial: Partial<ProductInput> = {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    costPrice: product.costPrice,
    oldPrice: product.oldPrice,
    material: product.material,
    fit: product.fit,
    weightGram: product.weightGram,
    emoji: product.emoji,
    description: product.description,
    isBestSeller: product.isBestSeller,
    isNew: product.isNew,
    isActive: product.isActive,
    sizes: product.sizes
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ label: s.label, stock: s.stock })),
    images: product.images
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((im) => ({ url: im.url, alt: im.alt })),
  };

  // bind id ke action update
  const action = updateProduct.bind(null, product.id);

  return (
    <div>
      <PageHeader title="Edit Produk" subtitle="Perbarui detail produk." />
      <ProductForm categories={categories} initial={initial} action={action} submitLabel="Simpan Perubahan" />
    </div>
  );
}
