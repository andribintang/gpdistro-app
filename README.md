# GPDISTRO — Toko Streetwear (Full-Stack)

Distro fashion online: kaos, kemeja, hoodie/jaket, celana, dan aksesoris dengan **varian ukuran + stok per ukuran**. Next.js 14 (App Router), TypeScript, Tailwind, Prisma + SQLite. Tema dark streetwear.

## Menjalankan di lokal

Butuh **Node.js 18+** (disarankan 20/22).

```bash
npm install
npm run setup        # buat tabel + isi data contoh (= prisma db push && seed)
npm run dev          # buka http://localhost:3000
```

### Perintah lain
```bash
npm run db:studio    # lihat/edit data lewat browser
npm run db:seed      # isi ulang data contoh
npm run build        # build produksi
```

## Struktur

```
prisma/
  schema.prisma      # Category, Product, ProductSize, Order, OrderItem
  seed.ts            # 5 kategori, 16 produk streetwear + varian ukuran
src/
  app/
    page.tsx               # beranda (hero, kategori, best seller, new arrival)
    products/page.tsx      # katalog + filter (?category= / ?new=1 / ?sale=1)
    products/[slug]/       # detail produk (pilih ukuran)
    cart/page.tsx          # keranjang + checkout
    api/orders/route.ts    # buat order (validasi stok per ukuran)
  components/        # Header, Footer, ProductCard, BuyBox
  lib/               # prisma, format, query produk, types
  store/cart.ts      # keranjang (Zustand) — line item per produk + ukuran
```

## Catatan model data (fashion)

- **Ukuran** disimpan di tabel `ProductSize` (label + stok per ukuran). Stok berkurang per ukuran saat checkout.
- Keranjang membedakan item per **produk + ukuran** (mis. Hoodie M dan Hoodie L = 2 baris).
- Ukuran fleksibel: pakaian `S/M/L/XL`, celana `28/30/32/34`, aksesoris `All Size`.
- Gambar pakai emoji sebagai placeholder — ganti ke `<Image>` dengan foto produk asli.

## Ganti Template Tampilan

Toko punya beberapa **template** yang bisa diganti dari **Admin → Tampilan** (`/admin/appearance`):
- **Streetwear** — gelap, bold, aksen volt (default)
- **Clean (ala Maujual)** — terang, bersih, aksen teal

Pilih salah satu → seluruh toko langsung berganti warna & font untuk semua pengunjung (tersimpan di tabel `Setting`).

> Karena ada tabel baru (`Setting`), jalankan `npx prisma db push` sekali setelah update (tidak menghapus data). Menambah template baru: tambah entri di `src/lib/themes.ts` + blok `[data-theme="…"]` di `src/app/globals.css`.

## Roadmap

- ✅ **Fase 1:** katalog, filter, detail + pilih ukuran, keranjang, checkout (order PENDING)
- ✅ **Fase 3:** **admin panel** — login, dashboard, CRUD produk & ukuran, kelola status pesanan
- ✅ **Fase 2:** pembayaran **Midtrans Snap** (sandbox) — popup bayar, verifikasi status, webhook, restock saat batal
- ✅ **Fase 4a:** **foto produk asli + galeri** — upload di admin, **kompres otomatis ke WebP ≤100KB** (sharp), emoji jadi fallback
- ✅ **Fase 4b:** **akun pelanggan** — daftar/login/logout, order dikaitkan ke akun, halaman "Pesanan Saya"
- ✅ **Fase 4c:** **alamat tersimpan** (pilih saat checkout) + **modul Pelanggan di admin**
- ✅ **Ongkir otomatis (RajaOngkir):** hitung ongkir multi-kurir saat checkout, harga divalidasi di server
- ✅ **Tabel produk admin premium:** pencarian, filter kategori, sort, indikator stok, status pill
- ⬜ **Lanjutan:** notifikasi WA/email, voucher, review produk, search, login Google
- ⬜ **Produksi:** SQLite → PostgreSQL, deploy (Vercel + Neon/Supabase)

## Ongkir Otomatis (RajaOngkir)

Isi di `.env`:
```
RAJAONGKIR_API_KEY="..."                              # dari panel rajaongkir.com
RAJAONGKIR_BASE_URL="https://api.rajaongkir.com/starter"  # starter | basic | pro
RAJAONGKIR_ORIGIN_CITY_ID="152"                       # ID kota asal toko (lihat daftar /city RajaOngkir)
RAJAONGKIR_COURIERS="jne,pos,tiki"                    # basic/pro bisa tambah sicepat,jnt,dll
```

Cara kerja:
1. Tiap produk punya **berat (gram)** — diatur di Admin → Produk.
2. RajaOngkir memakai **ID kota** (bukan kode pos). Pelanggan memilih **kota tujuan** dari daftar (diambil dari endpoint `/city`) saat menyimpan alamat / checkout.
3. Klik **Hitung Ongkir** → pilihan kurir + harga + estimasi (endpoint `/cost`, dipanggil per kurir lalu digabung).
4. Saat checkout, server **menghitung ulang ongkir** dan memakai harga dari RajaOngkir (anti-manipulasi); ongkir jadi baris tersendiri di Midtrans.

> **Tanpa API key**, sistem memakai **estimasi flat Rp20.000** agar alur tetap bisa dites.
> Jika kamu memakai endpoint RajaOngkir versi baru (Komerce), cukup ubah `RAJAONGKIR_BASE_URL` (struktur respons `rajaongkir.results` diasumsikan klasik).
>
> Menambah kolom `weightGram`, `cityId`, `cityLabel`, dan kolom ongkir di Order → jalankan `npx prisma db push` setelah update.

## Alamat & Pelanggan

- Pelanggan kelola alamat di **/account** (tambah/edit/hapus, set utama). Saat checkout dalam keadaan login, tinggal **pilih alamat tersimpan** — tidak perlu mengetik ulang. Tamu tetap bisa isi manual.
- Admin punya menu **Pelanggan** (`/admin/customers`): daftar pelanggan, total belanja, dan detail (alamat + riwayat pesanan).

> Menambah tabel `Address` → jalankan `npx prisma db push` sekali setelah update.

## Akun Pelanggan

- Daftar/masuk di **/account/register** & **/account/login** (ikon 👤 di header). Admin tetap terpisah di **/admin**.
- Password di-hash (bcryptjs), sesi pakai cookie httpOnly + tabel `Session` (kedaluwarsa 30 hari).
- Saat checkout dalam keadaan login, order otomatis dikaitkan ke akun → muncul di **Pesanan Saya** (`/account`). Checkout tamu tetap bisa.

> Fitur ini menambah tabel `User`, `Session`, dan kolom `userId` di `Order`, serta dependency baru. Jalankan: `npm install` lalu `npx prisma db push`.

## Foto Produk

Upload foto lewat **Admin → Produk → Edit/Baru → Foto produk**. File **dikompres otomatis ke WebP ≤100KB** (resize + turunkan kualitas bertahap via `sharp`), lalu disimpan di `public/uploads/` dengan path di tabel `ProductImage`. Foto pertama = gambar utama; tanpa foto, tampilan jatuh ke emoji.

> Tabel baru (`ProductImage`) → jalankan `npx prisma db push` sekali setelah update.
>
> Penyimpanan lokal ini cocok untuk dev. Saat deploy ke serverless (Vercel) filesystem bersifat sementara — ganti ke object storage (Cloudinary/UploadThing/S3) untuk produksi; cukup ubah endpoint `/api/admin/upload`.

## Pembayaran (Midtrans Snap)

Kredensial **sandbox** sudah diisi di `.env` (`MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, dll). **Jangan commit `.env` ke Git** dan rotasi key sebelum produksi.

Alur:
1. Checkout di `/cart` → order tersimpan (PENDING) → popup **Snap** terbuka.
2. Bayar pakai metode tes sandbox (kartu `4811 1111 1111 1114`, dll — lihat docs Midtrans).
3. Setelah popup selesai, frontend memanggil `/api/payment/status` → server **menanyakan status langsung ke Midtrans** (tepercaya) dan memperbarui order. Halaman `/order/[id]` menampilkan hasilnya.

### Webhook (opsional tapi disarankan)
Endpoint webhook ada di **`/api/payment/notification`** (verifikasi signature SHA512). Daftarkan URL-nya di:
Dashboard Midtrans → Settings → Configuration → **Payment Notification URL**.

Untuk lokal, Midtrans tidak bisa menjangkau `localhost`, jadi pakai tunnel:
```bash
npx ngrok http 3000
# lalu set Notification URL = https://xxxx.ngrok.app/api/payment/notification
```
Tanpa webhook pun status tetap akurat karena diverifikasi via `/api/payment/status`.

## Admin Panel

Buka **http://localhost:3000/admin** (atau klik ikon 👤 di toko).
Password default: `admin123` (ubah `ADMIN_PASSWORD` di `.env`).

Fitur: dashboard (omzet, stok menipis, pesanan terbaru), kelola produk (tambah/edit/hapus + atur ukuran & stok), dan ubah status pesanan (PENDING → PAID → SHIPPED → DONE).

> Catatan keamanan: login ini sederhana (cocok untuk dev lokal). Untuk produksi, ganti dengan auth yang proper (mis. Auth.js) dan password kuat.

## Ganti ke PostgreSQL (produksi)

Ubah `provider` di `prisma/schema.prisma` jadi `postgresql`, set `DATABASE_URL` di `.env`, lalu `npx prisma db push`.
