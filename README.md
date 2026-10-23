# Lembah Kopi FMIS (Farm Management Information System)

Sistem Informasi Manajemen Lahan dan Ketertelusuran Kopi untuk operasional kelompok tani di Desa Glodogan.

## 🚀 Quick Setup

Untuk panduan lengkap setup dari 0 bagi developer baru, silakan baca **[HANDOVER.md](./HANDOVER.md)**.

### Ringkasan Menjalankan Proyek:

```bash
# 1. Siapkan environment
cp core-system/.env.example core-system/.env
cp web-dashboard/.env.example web-dashboard/.env.local

# 2. Nyalakan Database PostGIS (Schema & Seed termigrasi otomatis)
make db

# 3. Jalankan Backend (port 8080)
make run-backend

# 4. Jalankan Frontend (port 3000)
make run-frontend
```

Buka **http://localhost:3000** dan login dengan:
* **Username**: `superadmin` atau `admin_glodogan`
* **Password**: `AdminLembahKopi2026!`

---

## 📦 Struktur Monorepo

* **[core-system/](./core-system)**: Backend REST API (Go 1.24, Chi Router, PostGIS, JWT).
* **[web-dashboard/](./web-dashboard)**: Frontend Dashboard (Next.js 16, React 19, Tailwind v4, Leaflet).
* **[docker/](./docker)**: Docker scripts & konfigurasi container.
* **[docker-compose.yml](./docker-compose.yml)**: Orkestrasi PostGIS, Backend, dan Frontend.
* **[Makefile](./Makefile)**: Otomatisasi perintah developer.
