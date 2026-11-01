# Checklist & Panduan Deployment VPS (Domain + HTTPS)

Panduan praktis langkah-demi-langkah untuk peluncuran `core-system` (Go API), `web-dashboard` (Next.js), `web-compro` (Next.js Community Profile), dan MinIO Object Storage di VPS Ubuntu/Debian.

---

## 📋 1. Persiapan DNS Record (Registrar / Cloudflare)

Arahkan DNS Record tipe **A** ke IP publik VPS Anda:

| Type | Name / Subdomain | Target / Value | Keterangan |
| :--- | :--- | :--- | :--- |
| **A** | `api` (atau `api.lembahkopi.id`) | `IP_VPS_ANDA` | Backend Go API Core-System |
| **A** | `admin` (atau `admin.lembahkopi.id`) | `IP_VPS_ANDA` | Web Dashboard Admin (Next.js) |
| **A** | `@` (atau `lembahkopi.id`) | `IP_VPS_ANDA` | Web Community Profile (Next.js) |
| **A** | `www` (atau `www.lembahkopi.id`) | `IP_VPS_ANDA` | Web Community Profile Alias |
| **A** | `cdn` (atau `cdn.lembahkopi.id`) | `IP_VPS_ANDA` | Object Storage MinIO (Foto CMS) |

> [!NOTE]
> Jika menggunakan Cloudflare, pada tahap inisiasi SSL pertama kali disarankan set **SSL/TLS encryption mode** ke **Full** (atau DNS Only / Grey Cloud saat verifikasi ACME).

---

## 🛠️ 2. Persiapan Server VPS

1. **Update package dan pasang Docker + Docker Compose plugin**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl git ufw
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   # Logout dan login kembali agar izin docker group aktif
   ```
2. **Konfigurasi Firewall (UFW)**:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP Let's Encrypt challenge & redirect
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

---

## 📁 3. Clone Repository & Konfigurasi Lingkungan Produksi

1. Clone repo di VPS:
   ```bash
   git clone <REPO_URL> /opt/lembah-kopi
   cd /opt/lembah-kopi
   ```
2. Salin template `.env.production.example` menjadi `.env.production`:
   ```bash
   cp .env.production.example .env.production
   ```
3. Edit `.env.production`:
   - Atur password database `POSTGRES_PASSWORD` (min. 24 karakter acak).
   - Generate string acak untuk `JWT_SECRET`:
     ```bash
     openssl rand -hex 32
     ```
   - Isi `MINIO_ROOT_PASSWORD`, `MINIO_ACCESS_KEY`, dan `MINIO_SECRET_KEY` dengan kredensial kuat.
   - Atur `APP_ENV=production` dan `SKIP_TEST_SEEDS=true`.
   - Pastikan `CORS_ALLOWED_ORIGINS` mencantumkan seluruh domain frontend HTTPS Anda (`https://admin.lembahkopi.id,https://lembahkopi.id,https://www.lembahkopi.id`).
   - Pastikan `MINIO_PUBLIC_URL` bernilai `https://cdn.lembahkopi.id`.

4. Sesuaikan domain pada [`deploy/Caddyfile`](file:///home/rendhi/workspaces/pengmas/lembah-kopi/deploy/Caddyfile) jika domain Anda berbeda dengan `lembahkopi.id`.

---

## 🚀 4. Menjalankan Seluruh Stack Aplikasi

`docker-compose.prod.yml` sudah dilengkapi dengan container reverse proxy **Caddy** otomatis (Let's Encrypt SSL, HTTP/2 & HTTP/3).

Jalankan perintah berikut:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Container yang akan berjalan:
- `lembah_kopi_prod_db`: PostgreSQL 16 + PostGIS
- `lembah_kopi_prod_minio`: MinIO Object Storage
- `lembah_kopi_prod_api`: Core-System Go API
- `lembah_kopi_prod_dashboard`: Web Dashboard FMIS & CMS (port internal 3000)
- `lembah_kopi_prod_compro`: Web Community Profile Publik (port internal 3001)
- `lembah_kopi_prod_caddy`: Caddy Reverse Proxy & Auto-SSL (port 80 & 443)

*(Opsional: Jika Anda memilih menjalankan Nginx atau Caddy langsung di host OS, port internal telah dibind secara aman ke `127.0.0.1:8080`, `127.0.0.1:3000`, `127.0.0.1:3001`, dan `127.0.0.1:9000`).*

---

## 👤 5. Inisiasi Akun Super Admin Produksi

Karena mode produksi (`APP_ENV=production` / `SKIP_TEST_SEEDS=true`) melewati akun seed bawaan, buat akun Super Admin pertama Anda menggunakan CLI bawaan yang aman:

```bash
docker compose -f docker-compose.prod.yml exec core-system /app/seed-admin \
  -email admin@lembahkopi.id \
  -username superadmin \
  -password "PasswordKuatMinimal8Karakter123!" \
  -name "Super Admin Lembah Kopi"
```

Atau jika dijalankan dari root repository:
```bash
ADMIN_PASSWORD="PasswordKuatMinimal8Karakter123!" make seed-prod-admin
```

Akun Super Admin ini dapat langsung digunakan untuk login di `https://admin.lembahkopi.id`.

---

## ✅ 6. Checklist Verifikasi Pasca-Deployment

Periksa endpoint-endpoint berikut via curl dari terminal lokal Anda:

1. **Liveness & Readiness**:
   ```bash
   curl -i https://api.lembahkopi.id/healthz
   # Respon yang diharapkan: HTTP 200 {"status":"UP", ...}

   curl -i https://api.lembahkopi.id/readyz
   # Respon yang diharapkan: HTTP 200 {"status":"UP","checks":{"database":"UP"}}
   ```

2. **Security Headers**:
   ```bash
   curl -I https://api.lembahkopi.id/healthz
   # Periksa header keamanan:
   # X-Content-Type-Options: nosniff
   # X-Frame-Options: DENY
   # Strict-Transport-Security: max-age=...
   ```

3. **CORS Preflight Test**:
   ```bash
   curl -i -X OPTIONS https://api.lembahkopi.id/api/v1/auth/login \
     -H "Origin: https://admin.lembahkopi.id" \
     -H "Access-Control-Request-Method: POST"
   # Respon yang diharapkan: HTTP 200 dengan header Access-Control-Allow-Origin
   ```

4. **Rate Limiting Test**:
   Lakukan request login bertubi-tubi (15 kali). Request ke-11 ke atas harus menghasilkan HTTP 429 Too Many Requests dengan header `Retry-After`.

5. **Akses Dashboard & Community Profile**:
   - Buka `https://lembahkopi.id` untuk memverifikasi profil komunitas publik dengan font Plus Jakarta Sans dan tombol WhatsApp terintegrasi.
   - Buka `https://admin.lembahkopi.id` dan login menggunakan kredensial Super Admin yang baru dibuat.
   - Uji upload foto CMS dan fitur "Pilih Foto atau Buka Kamera" di browser smartphone Anda.
