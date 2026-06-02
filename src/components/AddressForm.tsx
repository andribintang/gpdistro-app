import Link from "next/link";
import CitySelect from "@/components/CitySelect";

type AddressData = {
  id?: string;
  label?: string;
  recipient?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  cityId?: string;
  cityLabel?: string;
  isDefault?: boolean;
};

export default function AddressForm({
  action,
  initial,
  submitLabel,
  compact,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: AddressData;
  submitLabel: string;
  compact?: boolean;
}) {
  const field = "w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-bone outline-none placeholder:text-muted focus:border-volt";
  const lbl = "mb-1 block text-[12px] font-bold uppercase tracking-wide text-muted";

  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} name="label" defaultValue={initial?.label ?? ""} placeholder="Label (Rumah/Kantor)" />
        <input className={field} name="recipient" defaultValue={initial?.recipient ?? ""} placeholder="Nama penerima" />
      </div>
      <input className={field} name="phone" defaultValue={initial?.phone ?? ""} placeholder="No. WhatsApp" />
      <textarea className={field} name="address" rows={2} defaultValue={initial?.address ?? ""} placeholder="Alamat lengkap (jalan, no, RT/RW)" />
      <div>
        <label className={lbl}>Kota / Kabupaten (untuk ongkir)</label>
        <CitySelect defaultCityId={initial?.cityId ?? ""} defaultCityLabel={initial?.cityLabel ?? ""} />
      </div>
      <input className={field} name="postalCode" defaultValue={initial?.postalCode ?? ""} placeholder="Kode pos (opsional)" />
      <label className="flex cursor-pointer items-center gap-2 text-sm text-bone">
        <input type="checkbox" name="isDefault" defaultChecked={initial?.isDefault ?? false} className="h-4 w-4 accent-volt" />
        Jadikan alamat utama
      </label>
      <div className="flex gap-3">
        <button className="rounded-full bg-volt px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-bg transition hover:bg-volt-dark">{submitLabel}</button>
        {!compact && <Link href="/account" className="rounded-full border border-line px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-bone hover:border-volt hover:text-volt">Batal</Link>}
      </div>
    </form>
  );
}
