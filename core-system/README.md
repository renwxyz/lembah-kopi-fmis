# Lembah Kopi FMIS API

Backend internal untuk operasional kelompok tani di Desa Glodogan.

## Arsitektur

- `internal/domain`: model, aturan domain, dan kontrak repository.
- `internal/service`: use case dan validasi bisnis.
- `internal/repository/postgres`: adapter PostgreSQL dan PostGIS.
- `internal/delivery/http`: router, middleware, dan handler HTTP.
- `cmd/api`: composition root dan lifecycle server.

## Menjalankan API

Jalankan PostgreSQL/PostGIS, lalu siapkan database dengan migration schema dan initial data:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f migrations/000001_init_lembah_kopi_schema.up.sql \
  -f migrations/000002_seed_initial_data.sql \
  -f migrations/000003_add_agronomy_monitoring_history.up.sql \
  -f migrations/000004_extend_harvest_batch_traceability.up.sql
```

Seed initial data menyediakan akun admin untuk pengujian lokal:

- Username: `superadmin` atau `admin_glodogan`
- Password: `AdminLembahKopi2026!`

Akun dan password ini hanya untuk development/testing, bukan production. Menjalankan ulang `000002_seed_initial_data.sql` akan memperbarui akun admin testing tersebut, termasuk password-nya.

Konfigurasi wajib:

- `DATABASE_URL`: connection string PostgreSQL.
- `JWT_SECRET`: secret minimal 32 karakter.

Contoh konfigurasi untuk PostgreSQL pada `docker-compose.yml`:

```sh
export DATABASE_URL='postgres://postgres:postgrespassword@localhost:5432/lembah_kopi_db?sslmode=disable'
export JWT_SECRET="$(openssl rand -hex 32)"
```

Konfigurasi opsional:

- `HTTP_ADDRESS`: alamat listen; default `:8080`.
- `CORS_ALLOWED_ORIGINS`: allowlist origin frontend, dipisahkan koma. Origin preview VS Code (`vscode-webview://...` dan `https://*.vscode-webview.net`) diizinkan otomatis; origin frontend atau situs preview lain perlu ditambahkan di sini. Autentikasi menggunakan header `Authorization`, bukan cookie.

Untuk frontend lokal pada `http://localhost:3000`, set `CORS_ALLOWED_ORIGINS`
ke origin tersebut, termasuk skema dan port. Contoh:
`export CORS_ALLOWED_ORIGINS='http://localhost:3000'`. Jika konfigurasi
berubah, jalankan ulang proses API agar nilainya terbaca. Middleware menangani
preflight `OPTIONS` dan mengizinkan `Authorization`, `Content-Type`, serta
`X-Requested-With`. Cookie credentials tidak diaktifkan karena autentikasi
menggunakan bearer token.

Setelah environment tersedia, jalankan:

```sh
go run ./cmd/api
```

Dokumentasi API berbasis OpenAPI 3.0.3 tersedia di `/swagger/index.html`. Sumber kontrak tunggal berada di [`docs/openapi.yaml`](docs/openapi.yaml) dan juga dapat diakses langsung melalui `/openapi.yaml`. Semua error API menggunakan `application/problem+json` sesuai RFC 9457; endpoint DELETE yang berhasil mengembalikan `204 No Content`.

ERD schema tersedia di [`docs/erd.md`](docs/erd.md). Untuk database yang sudah menggunakan migration `000001` dan seed `000002`, terapkan migration `000003_add_agronomy_monitoring_history.up.sql` lalu `000004_extend_harvest_batch_traceability.up.sql`. Rollback migration `000003` tidak mempertahankan entri histori penanganan tambahan; rollback `000004` menghapus katalog metode, histori tahap, dan data modul yang baru ditambahkan.

## Modul 1 — Manajemen Geospasial & Lahan

Seluruh endpoint berikut memerlukan token JWT pada header `Authorization` dan dapat digunakan oleh `SUPER_ADMIN` maupun `ADMIN_KELOMPOK_TANI`.

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| `GET`, `POST` | `/api/v1/petani` | Daftar/pencarian dan tambah petani |
| `GET`, `PUT`, `DELETE` | `/api/v1/petani/{id}` | Detail, ubah, dan hapus petani |
| `GET`, `POST` | `/api/v1/lahan` | Daftar/filter dan daftarkan lahan |
| `GET`, `PUT`, `DELETE` | `/api/v1/lahan/{id}` | Detail, ubah, dan hapus lahan |
| `PUT`, `DELETE` | `/api/v1/lahan/{id}/polygon` | Simpan atau hapus polygon |
| `GET`, `POST` | `/api/v1/lahan/{id}/inventaris` | Daftar atau tambah inventaris lahan |
| `GET`, `PUT`, `DELETE` | `/api/v1/inventaris/{id}` | Detail, ubah, dan hapus inventaris |
| `GET` | `/api/v1/lahan/{id}/populasi-pohon` | Populasi per blok inventaris dan total pohon lahan |
| `PUT` | `/api/v1/inventaris/{id}/populasi-pohon` | Ubah jumlah pohon pada satu blok |

Section API spec dikelompokkan berdasarkan domain: `Petani`, `Lahan`, `Pemetaan Polygon (GIS)`, `Inventaris Tanaman`, dan `Populasi Pohon`.

## Modul 3 — Manajemen Panen & Tracking Pascaproses

Semua endpoint Modul 3 memerlukan token JWT. Endpoint operasional dapat digunakan oleh kedua role admin; perubahan katalog metode hanya dapat dilakukan oleh `SUPER_ADMIN`. Detail skema request/response tersedia pada OpenAPI.

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| `GET`, `POST` | `/api/v1/lahan/{id}/panen` | Daftar dan catat panen pada lahan |
| `GET`, `PUT`, `DELETE` | `/api/v1/panen/{id}` | Detail, koreksi, dan hapus catatan panen |
| `GET` | `/api/v1/metode-pascaproses` | Daftar metode aktif |
| `POST` | `/api/v1/metode-pascaproses` | Tambah metode katalog (Super Admin) |
| `PUT`, `DELETE` | `/api/v1/metode-pascaproses/{kode}` | Ubah/nonaktifkan metode (Super Admin) |
| `GET`, `POST` | `/api/v1/batch` | Daftar dan buat batch pascaproses |
| `GET`, `PUT`, `DELETE` | `/api/v1/batch/{id}` | Detail, ubah target/hasil, dan hapus batch |
| `GET`, `POST` | `/api/v1/batch/{id}/tahap` | Lihat dan catat histori tahap/kadar air |
| `GET`, `POST` | `/api/v1/batch/{id}/panen` | Lihat dan alokasikan berat panen ke batch |
| `PUT`, `DELETE` | `/api/v1/batch/{id}/panen/{mapping_id}` | Koreksi atau hapus alokasi |
| `GET` | `/api/v1/batch/{id}/traceability` | Telusuri lahan, inventaris, panen, dan histori tanah asal |

Satu catatan panen dapat dibagi ke beberapa batch, tetapi total alokasinya tidak boleh melebihi berat panen. Sistem menghitung ulang status alokasi (`UNPROCESSED`, `PARTIAL`, `FULLY_BATCHED`) dan total input batch dari mapping. Panen baru harus menunjuk inventaris tanaman sebagai sumber varietas dan kelompok usia. Kadar air aktual disimpan sebagai histori tahap; target kadar air dan estimasi selesai merupakan target proses pada batch.

## Modul 2 — Agronomi & Monitoring Lingkungan Lahan

Seluruh endpoint Modul 2 memerlukan token JWT dan dapat digunakan oleh `SUPER_ADMIN` maupun `ADMIN_KELOMPOK_TANI`. Terapkan migration `000003_add_agronomy_monitoring_history.up.sql` setelah migration schema dan seed sebelum menjalankan endpoint berikut.

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| `GET`, `POST` | `/api/v1/lahan/{id}/kondisi-tanah` | Histori sampling dan catat hasil ukur baru |
| `GET` | `/api/v1/kondisi-tanah/{id}` | Detail satu pengukuran tanah |
| `GET`, `POST` | `/api/v1/lahan/{id}/pemupukan` | Daftar dan catat aplikasi pemupukan aktual |
| `GET`, `PUT`, `DELETE` | `/api/v1/pemupukan/{id}` | Detail, koreksi, dan hapus aplikasi pemupukan |
| `GET`, `POST` | `/api/v1/lahan/{id}/hama-penyakit` | Daftar dan laporkan insiden |
| `GET`, `PUT`, `DELETE` | `/api/v1/hama-penyakit/{id}` | Detail, koreksi data insiden, dan hapus insiden |
| `GET`, `POST` | `/api/v1/hama-penyakit/{id}/penanganan` | Lihat dan tambahkan histori tindakan/status |

Sampling tanah bersifat historis dan tidak dapat diubah atau dihapus melalui API. Parameter yang tidak didukung atau tidak terbaca oleh alat dapat dibiarkan kosong; jika sampling memantau pemupukan, `id_pemupukan` dan `tahap_pemantauan` (`SEBELUM`/`SESUDAH`) wajib diberikan bersama. Aplikasi pemupukan hanya merekam kegiatan aktual, bukan jadwal.

Setiap insiden baru dimulai dengan status `TERDETEKSI`. Perubahan tindakan atau status harus ditambahkan sebagai catatan penanganan baru agar jejak historis tidak tertimpa. Daftar histori memakai pagination default `page=1`, `page_size=20`, maksimum 100; filter waktu kondisi tanah menggunakan RFC 3339, sedangkan filter tanggal insiden menggunakan `YYYY-MM-DD`.

Lihat [OpenAPI contract](docs/openapi.yaml) untuk detail tipe dan batasan request/response, serta [ERD](docs/erd.md) untuk relasi antar tabel.

Endpoint daftar menerima `page` dan `page_size` (default 1 dan 20; maksimum 100). Petani mendukung `search`; lahan mendukung `farmer_id` dan `search`.

Polygon dikirim sebagai GeoJSON Polygon di dalam properti `polygon_geom`. Posisi mengikuti standar GeoJSON `[longitude, latitude]`:

```json
{
  "polygon_geom": {
    "type": "Polygon",
    "coordinates": [[[110.005, -7.3305], [110.006, -7.3305], [110.006, -7.3315], [110.005, -7.3315], [110.005, -7.3305]]]
  }
}
```

Inventaris tanaman mencatat varietas dan kelompok usia. Populasi pohon dikelola melalui endpoint terpisah: jumlah per blok inventaris dan total lahan (`lahan.total_pohon`) ditampilkan pada konteks Populasi Pohon, dan total diperbarui dalam transaksi ketika populasi berubah atau inventaris dihapus. Inventaris baru dimulai dengan jumlah pohon nol.

PostGIS memvalidasi polygon, menghitung `luas_m2` dalam m² melalui trigger migrasi, dan menolak polygon yang beririsan atau hanya bersentuhan dengan polygon lahan lain.

Penghapusan petani ditolak jika masih memiliki lahan. Penghapusan lahan menghapus inventaris terkait sesuai cascade, tetapi dapat ditolak bila masih direferensikan riwayat panen sesuai foreign key migrasi.
