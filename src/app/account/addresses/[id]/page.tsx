import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-customer";
import { updateAddress } from "../../actions";
import AddressForm from "@/components/AddressForm";

export const dynamic = "force-dynamic";

export default async function EditAddress({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");

  const address = await prisma.address.findFirst({ where: { id: params.id, userId: user.id } });
  if (!address) notFound();

  const action = updateAddress.bind(null, address.id);

  return (
    <div className="mx-auto max-w-[560px] px-5 py-10">
      <h1 className="disp mb-6 text-3xl text-bone">Edit Alamat</h1>
      <div className="rounded-xl2 border border-line bg-surface p-5">
        <AddressForm
          action={action}
          submitLabel="Simpan Perubahan"
          initial={{
            label: address.label, recipient: address.recipient,
            phone: address.phone, address: address.address,
            postalCode: address.postalCode, cityId: address.cityId, cityLabel: address.cityLabel,
            isDefault: address.isDefault,
          }}
        />
      </div>
    </div>
  );
}
