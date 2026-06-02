import { getCategories } from "@/lib/products";
import { createProduct } from "@/app/admin/actions";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="disp mb-7 text-3xl text-bone">Produk Baru</h1>
      <ProductForm categories={categories} action={createProduct} submitLabel="Simpan Produk" />
    </div>
  );
}
