import { getCategories } from "@/lib/products";
import { createProduct } from "@/app/admin/actions";
import ProductForm from "@/components/ProductForm";
import { PageHeader } from "@/components/admin/ui/kit";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const categories = await getCategories();
  return (
    <div>
      <PageHeader title="Produk Baru" subtitle="Tambah produk ke katalog." />
      <ProductForm categories={categories} action={createProduct} submitLabel="Simpan Produk" />
    </div>
  );
}
