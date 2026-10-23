# Lembah Kopi Dashboard

Dashboard operasional untuk sistem perkebunan dan traceability Lembah Kopi.

## Prasyarat

- Node.js 20 atau lebih baru
- API `core-system` berjalan secara lokal (default `http://localhost:8080`)

## Konfigurasi lokal

Buat `.env.local` dengan URL API internal. Nilai ini hanya dibaca oleh Route Handlers Next.js dan tidak dikirim ke browser.

```env
API_BASE_URL=http://localhost:8080/api/v1
```

Lalu jalankan aplikasi:

```bash
npm install
npm run dev
```

Untuk menyiapkan API dan database, lihat [`../core-system/README.md`](../core-system/README.md).

## Validasi

```bash
npm run lint
npm run typecheck
npm run build
```

## Konvensi pengembangan

- `src/app` hanya untuk routing, layout, dan Route Handler Next.js.
- `src/features/<domain>` menyimpan API browser, hooks React Query, tipe, dan validasi untuk satu domain bisnis.
- Komponen atau page client tidak boleh meminta API backend secara langsung. Akses backend harus melewati Route Handler `/api/*` yang menyimpan dan meneruskan token di server.
- Access token disimpan dalam cookie `httpOnly` bernama `access_token`; jangan pernah membaca atau menulis token dari JavaScript browser.
- Setiap perubahan harus lulus `npm run lint` dan `npm run typecheck`.

## Alur autentikasi

1. Form login memanggil `/api/auth/login`.
2. Route Handler meneruskan kredensial ke `core-system` dan menyimpan JWT pada cookie `httpOnly`.
3. Route Handler domain, misalnya `/api/lahan`, membaca cookie tersebut dan meneruskan header `Authorization` ke backend.
4. Browser hanya menerima data domain atau profil user, bukan JWT.
