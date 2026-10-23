# Lembah Kopi FMIS — Developer Handover & Setup Guide

Dokumen ini ditujukan untuk rekan pengembang yang akan melanjutkan atau menjalankan proyek **Lembah Kopi Farm Management Information System (FMIS)** di lingkungan lokal (*development*).

---

## 1. Ikhtisar Arsitektur

Repository ini berbentuk **monorepo** yang terdiri dari dua sub-proyek utama:

```
lembah-kopi/
├── core-system/          # Backend REST API (Go 1.24 + Chi Router + PostGIS)
│   ├── cmd/api/          # Composition root & HTTP server entrypoint
│   ├── internal/         # Clean Architecture (domain, service, repository, delivery)
│   ├── migrations/       # SQL Migration & Seeding files
│   └── docs/             # Dokumentasi API (OpenAPI 3.0 / Swagger)
├── web-dashboard/        # Frontend Dashboard (Next.js 16 + React 19 + Tailwind v4 + Leaflet)
│   ├── src/app/          # Next.js App Router & API Route Handlers (Proxy)
│   ├── src/components/   # Reusable UI & Feature components (GIS Map, Modal, Layout)
│   ├── src/features/     # Feature-based logic, API clients, & TanStack Query hooks
│   └── src/lib/          # Shared utilities (session cookie, backend client, formatting)
├── docker/               # Script inisialisasi & container helper
├── docker-compose.yml    # Root Docker Compose (PostGIS + Fullstack services)
├── Makefile              # Shortcut perintah developer
└── HANDOVER.md           # Panduan ini
```

---

## 2. Prasyarat Sistem (*Prerequisites*)

Pastikan perangkat lokal Anda telah terpasang:
* **Docker & Docker Compose** (v2.20+)
* **Go** (v1.24 atau lebih baru)
* **Node.js** (v20+ LTS) & **npm** (v10+)
* **Make** *(opsional tapi sangat disarankan untuk automasi command)*

---

## 3. Quickstart (Cara Cepat Menjalankan)

### **Opsi A: Mode Hybrid (Sangat Disarankan untuk Development)**
*Database berjalan di Docker, backend dan frontend dijalankan secara native di host untuk mendapatkan hot reload instan.*

#### **Langkah 1: Setup Environment**
Salin template environment untuk backend dan frontend:
```bash
# Backend environment
cp core-system/.env.example core-system/.env

# Frontend environment
cp web-dashboard/.env.example web-dashboard/.env.local
```

#### **Langkah 2: Jalankan Database PostgreSQL + PostGIS**
Gunakan Make:
```bash
make db
```
*Atau langsung via Docker:*
```bash
docker compose up -d postgres
```
> **Catatan:** Saat kontainer database dibuat pertama kali, skrip `docker/init-db.sh` akan **otomatis mengeksekusi semua migrasi schema dan initial seed data**. Anda tidak perlu menjalankan migrasi manual.

#### **Langkah 3: Jalankan Backend Core System**
Buka terminal baru:
```bash
make run-backend
```
*Atau secara manual:*
```bash
cd core-system
export $(cat .env | grep -v '^#' | xargs)
go run ./cmd/api
```
Backend akan aktif di: `http://localhost:8080` (Cek status: `http://localhost:8080/healthz`).

#### **Langkah 4: Jalankan Web Dashboard**
Buka terminal baru:
```bash
# Pastikan dependensi npm terinstall
cd web-dashboard
npm install

# Jalankan dev server
npm run dev
```
Dashboard akan aktif di: `http://localhost:3000`.

---

### **Opsi B: Mode Full Container (All-in-One Docker)**
*Jika Anda ingin menyalakan seluruh stack (Database, Backend, Frontend) sekaligus tanpa perlu setup Go/Node di host:*

```bash
docker compose up --build -d
```
Semua service akan otomatis saling terhubung:
* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:8080`
* **Database**: `localhost:5432`

Untuk menghentikan:
```bash
docker compose down
```

---

## 4. Kredensial Akun Pengujian Lokal

Database sudah terisi data awal (*seed data*) untuk pengujian login:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `AdminLembahKopi2026!` |
| **Admin Kelompok Tani** | `admin_glodogan` | `AdminLembahKopi2026!` |

> Password di atas di-hash dengan bcrypt (`$2a$10$...`) dan hanya diperuntukkan bagi kebutuhan testing lokal.

---

## 5. Ringkasan Environment Variables

### **Backend (`core-system/.env`)**
| Variabel | Default / Contoh | Deskripsi |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgres://postgres:postgrespassword@localhost:5432/lembah_kopi_db?sslmode=disable` | Connection string PostgreSQL PostGIS |
| `JWT_SECRET` | *(string minimal 32 karakter)* | Secret key enkripsi token login |
| `HTTP_ADDRESS` | `:8080` | Port listen server API |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Whitelist origin frontend |

### **Frontend (`web-dashboard/.env.local`)**
| Variabel | Default / Contoh | Deskripsi |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080/api/v1` | URL API yang diakses browser |
| `API_BASE_URL` | `http://localhost:8080/api/v1` | URL API untuk server-side fetch di Next.js |

---

## 6. Manajemen Database & Migrasi Manual

Jika sewaktu-waktu data database perlu di-reset atau dimigrasikan ulang:

* **Reset Database total (Hapus volume & buat ulang dari nol):**
  ```bash
  make db-reset
  # atau: docker compose down -v && docker compose up -d postgres
  ```
* **Jalankan migrasi / re-seed tanpa menghapus volume:**
  ```bash
  make db-seed
  ```
* **Urutan file migrasi:**
  1. `000001_init_lembah_kopi_schema.up.sql` (Role, User, Petani, Lahan, PostGIS polygon)
  2. `000002_seed_initial_data.sql` (User admin & kelompok tani Glodogan)
  3. `000003_add_agronomy_monitoring_history.up.sql` (Aktivitas agronomi & monitoring pohon)
  4. `000004_extend_harvest_batch_traceability.up.sql` (Batch panen, pascaproses, dan penelusuran QR)

---

## 7. Status Fitur Terkini (*Current Progress*)

Berikut rangkuman fitur yang sudah aktif dan terintegrasi:

1. **Dashboard Overview (`/dashboard`)**:
   * Statistik ringkasan (Total Lahan, Petani, Batch Aktif, Estimasi Panen).
   * **Peta GIS Interaktif**: Render poligon lahan nyata via PostGIS GeoJSON & Leaflet, auto-bounds camera, tooltip detail lahan & pemilik.
   * Tabel batch aktif & daftar aktivitas terbaru.
2. **Modul Manajemen Lahan (`/dashboard/lahan`)**:
   * Menampilkan daftar lahan terdaftar beserta status sertifikasi dan luas area.
   * **Modal Tambah Lahan**: Dialog form terintegrasi validasi Zod & dropdown pemilihan petani dari database.
3. **Autentikasi & Proxy**:
   * Login berbasis JWT Bearer token yang disimpan aman di `httpOnly` cookie (`access_token`).
   * Route Handlers di Next.js (`/api/*`) bertindak sebagai proxy aman ke `core-system`.
4. **Dokumentasi API**:
   * Spesifikasi lengkap OpenAPI 3.0 tersedia di `core-system/docs/openapi.yaml`.

---

## 8. Panduan Troubleshooting (FAQ)

### Q1: `bind: address already in use` pada port 5432
* **Penyebab**: Service PostgreSQL bawaan host lokal Anda sedang aktif.
* **Solusi**: Matikan PostgreSQL lokal (`sudo systemctl stop postgresql`) atau ubah port host pada `docker-compose.yml` (misal `"5433:5432"` dan sesuaikan `DATABASE_URL`).

### Q2: Backend gagal start dengan error `JWT_SECRET must contain at least 32 characters`
* **Solusi**: Pastikan nilai `JWT_SECRET` pada `core-system/.env` memiliki panjang minimal 32 karakter (contoh: `lembah-kopi-secret-key-development-minimum-32-chars-long`).

### Q3: Peta GIS Leaflet error `window is not defined`
* **Solusi**: Leaflet membutuhkan objek browser (`window`). Komponen peta di `src/components/features/gis/dashboard-map.tsx` wajib diimpor menggunakan `dynamic(() => import(...), { ssr: false })`. Pola ini sudah diterapkan pada `dashboard-map-hero.tsx`.

### Q4: Koordinat Poligon terbalik di Peta
* **Penyebab**: PostGIS mengekspor GeoJSON dalam format `[Longitude, Latitude]`, sedangkan Leaflet membutuhkan `[Latitude, Longitude]`.
* **Solusi**: Selalu gunakan pembalik koordinat `[coord[1], coord[0]]` seperti yang sudah diimplementasikan di `dashboard-map.tsx`.

---

## 9. Menjalankan Pengujian (Testing)

Untuk memastikan seluruh kode backend dan frontend dalam kondisi sehat:
```bash
make test
```
* Backend Go: Menjalankan unit tests pada router, service, dan handler (`go test -v ./...`).
* Frontend Next.js: Menjalankan pemeriksaan tipe data TypeScript (`npm run typecheck`).
