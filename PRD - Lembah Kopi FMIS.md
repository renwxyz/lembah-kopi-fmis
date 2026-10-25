# PRD \- Lembah Kopi FMIS

**Lembah Kopi FMIS** \(*Farm Management Information System*\) adalah sistem informasi pengelolaan perkebunan kopi internal yang dirancang khusus untuk memenuhi kebutuhan operasional kelompok tani di Desa Glodogan\.

Saat ini, pendataan lahan, jumlah populasi pohon, riwayat pemupukan, hingga catatan hasil panen di tingkat kelompok tani masih dilakukan secara manual dan terfragmentasi\. Kondisi ini menyulitkan pengurus kelompok tani dalam memetakan potensi wilayah secara presisi, memantau kesehatan tanah pasca\-pemupukan, serta melakukan penelusuran \(traceability\) asal\-usul biji kopi berdasarkan metode pengolahannya \(batch processing\)\.



**Tujuan Utama Sistem:**

1. **Digitalisasi Spasial Lahan:** Mengubah pendataan lahan manual menjadi pemetaan berbasis geospasial \(polygon\) untuk mengukur luasan area dan estimasi populasi pohon secara akurat\.

2. **Monitoring Agronomi \& Lingkungan:** Menyediakan log pencatatan kondisi tanah berbasis alat *6\-in\-1 Soil Analyzer*, jadwal pemupukan berkala, dan penanganan hama\.

3. **Pencatatan Panen \& Tracking Pascaproses:** Mengelompokkan hasil panen ceri menjadi *batch* olahan \(seperti *Normal/Natural, Wash, Full Wash, Wine*\) yang terhubung langsung ke identitas lahan asal\.



Sistem ini diakses secara internal oleh **Super Admin** dan **Admin** kelompok tani melalui portal\.



## **Modul 1: Manajemen Geospasial \& Lahan**

### M1\.1 — Profil Identitas Lahan \& Pemilik

Sub\-Modul ini mengelola pencatatan data pemilik lahan secara manual \(nama, kontak, identitas anggota kelompok tani\) Beserta deskripsi fisik lahan dan catatan lokasi spesifik di Desa Glodogan\. 



**F1\.1\.1 — Manajemen Data Petani:** Menambah, mengubah, dan melihat daftar anggota kelompok tani\.

**F1\.1\.2 — Manajemen Profil Lahan:** Mendaftarkan petak lahan baru dan menghubungkannya ke ID petani\.

**F1\.1\.3 — Pinpoint Lokasi Dasar:** Menentukan 1 titik koordinat acuan \(lat/long\) lokasi lahan di peta\.



- **`petani`**: `id_petani` \(PK\), `nama_lengkap`, `no_hp`\.

- **`lahan`**: `id_lahan` \(PK\), `id_petani` \(FK\), `nama_petak`, `dusun`, `elevasi_mdpl`, `latitude`, `longitude`, `total_pohon` \(INT\)\.



### M1\.2 — Pemetaan Spasial Polygon \(GIS\)

Sub\-modul ini mengelola plotting batas wilayah luasan lahan menggunakan koordinat spasial Polygon \(GEOMETRY\(Polygon, 4326\)\) beserta kalkulasi otomatis luasan area lahan \($m^2$ / hektar\) dari polygon PostGIS \(ST\_Area\)\.



**F1\.2\.1 — Drawing \& Plotting Polygon:** Membuat, mengubah, dan menghapus batas geometris lahan \(*polygon*\) di atas peta interaktif\.

**F1\.2\.2 — Kalkulasi Luas Lahan Otomatis:** Menghitung luas area lahan secara *real\-time* berbasis data geospasial\.

**F1\.2\.3 — Spasial Overlap Checker:** Memeriksa apakah *polygon* lahan baru bersinggungan/tumpang\-tindih dengan *polygon* lahan yang sudah ada\.



- `polygon_geom` \(GEOMETRY\(Polygon, 4326\)\) — Array koordinat GPS yang membentuk area tertutup\.

- `luas_m2` \(DECIMAL\) — Luas area dalam satuan meter persegi\.



### M1\.3 — Inventarisasi Tanaman \& Populasi Pohon

Sub\-modul ini mengelola input estimasi jumlah pohon kopi per lahan \(skala ribuan pohon\), mencatat varietas/jenis kopi per blok lahan \(**Robusta** dan **Arabika\) **dan** **Pencatatan kelompok usia tanaman kopi\.



**F1\.3\.1 — Pendataan Blok Tanam \& Varietas:** Mengelompokkan jenis/varietas kopi \(Robusta atau Arabika\) pada petak lahan tertentu\.

**F1\.3\.2 — Pencatatan Populasi Pohon:** Menginput estimasi jumlah pohon kopi aktif per varietas/blok \(skala ribuan pohon\)\.

**F1\.3\.3 — Tracking Usia Tanaman:** Mencatat kategori/kelompok usia tanaman kopi untuk kebutuhan analisis produktivitas\.



- `id_inventaris` \(VARCHAR, PK\) — Kode Unik \(misal: `INV-LHN01-01`\)\.

- `id_lahan` \(VARCHAR, FK ke `lahan`\) — Referensi lahan asal\.

- `varietas` \(ENUM: `ROBUSTA`, `ARABIKA`\) — Jenis kopi utama\.

- `jumlah_pohon` \(INT\) — Jumlah/populasi pohon \(misal: `1500`\)\.

- `kelompok_usia` \(ENUM: `LIMA_TAHUN_KURANG`, `LIMA_BELAS_TAHUN_KURANG`, `LIMA_BELAS_TAHUN_LEBIH`\) — Kategori kelompok usia tanaman\.



## **Modul 2: Agronomi \& Monitoring Lingkungan Lahan**

### M2\.1 — Sampling Parameter Tanah \(6\-in\-1 Soil Analyzer\)

Sub\-modul ini mengelola input hasil pengukuran sampling kondisi tanah dari alat *6\-in\-1 analyzer* \(seperti pH tanah, kelembapan, nutrisi/EC, dll\.\) dan mencatat histori perubahan parameter tanah dari waktu ke waktu\.



**F2\.1\.1 — Input Log Sampling Tanah:** Mencatat hasil pengukuran dari alat 6\-in\-1 Soil Analyzer untuk petak lahan tertentu\.

**F2\.1\.2 — Histori \& Tren Kondisi Tanah:** Menampilkan riwayat perubahan indikator tanah berdasarkan urutan waktu \(*chronological log*\)\.



**Tabel: ****`log_kondisi_tanah`** 

- `id_log_tanah` \(VARCHAR, PK\) — Kode unik log \(misal: `LOG-LHN01-001`\)\.

- `id_lahan` \(VARCHAR, FK ke `lahan`\) — Referensi lahan yang diukur\.

- `tanggal_ukur` \(DATETIME\) — Tanggal dan waktu pengambilan sampel\.

- `ph_tanah` \(DECIMAL\(3,1\)\) — Derajat keasaman tanah\.

- `kelembapan` \(DECIMAL\(5,2\)\) — Kelembapan tanah \(dalam %\)\.

- `suhu_celsius` \(DECIMAL\(4,1\)\) — Suhu tanah \(°C\)\.

- `n_value` \(INT\) — Kandungan Nitrogen \(mg/kg\)\.

- `p_value` \(INT\) — Kandungan Fosfor \(mg/kg\)\.

- `k_value` \(INT\) — Kandungan Kalium \(mg/kg\)\.

- `ec_value` \(INT\) — Electrical Conductivity / Konduktivitas Listrik \($\mu\text{S/cm}$\)\.



### M2\.2 — Log Riwayat Pemupukan

Sub\-modul ini mencatat tanggal dan jadwal aplikasi pemupukan \(siklus \~6 bulanan, misal: pemupukan NPK bulan Desember\) dan memantau respons kenaikan kondisi/kualitas tanah pasca\-pemupukan\.



**F2\.1\.1 / F2\.2\.1 — Pencatatan Aplikasi Pemupukan:** Mencatat pelaksanaan pemupukan berkala \(misal: siklus NPK 6 bulanan\)\.

**F2\.2\.2 — Pemantauan Respons Tanah \(Post\-Fertilization Monitoring\):** Mengaitkan jadwal pemupukan dengan data log tanah \(M2\.1\) sebelum dan sesudah intervensi\.



**Tabel: ****`riwayat_pemupukan`** *\(Entitas Baru\)*

- `id_pemupukan` \(VARCHAR, PK\) — Kode unik aktivitas \(misal: `PUP-LHN01-01`\)\.

- `id_lahan` \(VARCHAR, FK ke `lahan`\) — Lahan target pemupukan\.

- `tanggal_aplikasi` \(DATE\) — Tanggal pelaksanaan pemupukan\.

- `jenis_pupuk` \(VARCHAR\) — Nama/jenis pupuk \(misal: `NPK 16-16-16`, `Organik Compost`\)\.

- `dosis_kg` \(DECIMAL\) — Total jumlah pupuk yang diaplikasikan \(kg\)\.



### M2\.3 — Catatan Hama \& Penyakit Tanaman

Sub\-modul ini mengelola log insiden serangan hama atau penyakit pada tanaman kopi dan mencatat kondisi kesehatan tanaman dan tindakan penanganan yang telah dilakukan\.



**F2\.3\.1 — Pelaporan Insiden Hama/Penyakit:** Mencatat temuan serangan hama atau penyakit pada petak lahan tertentu\.

**F2\.3\.2 — Log Penanganan \& Status Kesehatan:** Mencatat tindakan korektif/penanganan yang dilakukan beserta pembaruan status pemulihan tanaman\.



**Tabel: ****`riwayat_hama_penyakit`** *\(Entitas Baru\)*

- `id_insiden` \(VARCHAR, PK\) — Kode unik catatan \(misal: `HMA-LHN01-01`\)\.

- `id_lahan` \(VARCHAR, FK ke `lahan`\) — Lahan terdampak\.

- `tanggal_ditemukan` \(DATE\) — Tanggal ditemukannya gejala/insiden\.

- `jenis_hama_penyakit` \(VARCHAR\) — Nama hama/penyakit \(misal: `Penggerek Buah Kopi (PBKo)`, `Karat Daun`\)\.

- `tingkat_serangan` \(ENUM: `RINGAN`, `SEDANG`, `BERAT`\) — Kategori keparahan insiden\.

- `tindakan_penanganan` \(TEXT\) — Catatan aksi yang dilakukan \(misal: penyemprotan hayati, pemangkasan\)\.

- `status_penanganan` \(ENUM: `TERDETEKSI`, `DALAM_PENANGANAN`, `TERKENDALI`\) — Status pemulihan lahan\.



## **Modul 3: Manajemen Panen \& Tracking Pascaproses \(Batching\)**

### M3\.1 — Pencatatan Hasil Panen \(Harvest Log\)

Sub\-modul ini mencatat tanggal panen, estimasi tonase/berat \($kg$\), dan metode pemetikan \(petik merah murni vs\. petik pelangi/campuran\) serta mengelola kategori varietas kopi hasil panen \(Robusta / Arabika\)\.



**F3\.1\.1 — Input Penerimaan Hasil Panen:** Mencatat penerimaan ceri kopi harian dari petani berdasarkan lahan asal\.

**F3\.1\.2 — Klasifikasi Pemetikan \& Varietas:** Mencatat metode pemetikan dan mengaitkan varietas kopi yang dipanen\.



**Tabel: ****`riwayat_panen`** *\(Entitas Baru\)*

- `id_panen` \(VARCHAR, PK\) — Kode unik transaksi panen \(misal: `HVT-20261022-001`\)\.

- `id_lahan` \(VARCHAR, FK ke `lahan`\) — Lahan tempat panen dilakukan\.

- `tanggal_panen` \(DATE\) — Tanggal pelaksanaan panen\.

- `berat_ceri_kg` \(DECIMAL\) — Total berat ceri kopi mentah yang ditimbang \(kg\)\.

- `metode_petik` \(ENUM: `PETIK_MERAH`, `PETIK_PELANGI`\) — Kualitas sortasi pemetikan\.

- `varietas` \(ENUM: `ROBUSTA`, `ARABIKA`\) — Varietas utama hasil panen\.

- `status_alokasi` \(ENUM: `UNPROCESSED`, `PARTIAL`, `FULLY_BATCHED`\) — Tracking status penggunaan ceri untuk batch processing\.



### M3\.2 — Tracking Metode Pascaproses \(Ceri ke Biji\)

Sub\-modul ini mencatat alur olah ceri kopi menjadi biji: **Normal/Natural** \(keringkan \& tumbuk\), **Wash**, **Full Wash** \(rendam \& cuci\), **Wine** \(fermentasi\), dan metode kustom lainnya\.



**F3\.2\.1 — Master Katalog Metode Pascaproses:** Mengelola daftar metode pengolahan ceri menjadi green bean \(Natural, Wash, Full Wash, Wine, Honey, dll\.\)\.

**F3\.2\.2 — Monitoring Tahapan Pemrosesan:** Mencatat tanggal mulai, estimasi selesai, dan parameter target \(seperti target kadar air %\)\.



**Tabel: ****`batch_pascaproses`** *\(Entitas Baru\)*

- `id_batch` \(VARCHAR, PK\) — ID unik rantai olah \(misal: `BTC-GLD-202610-001`\)\.

- `kode_qr_trace` \(VARCHAR, UNIQUE\) — Hash/string unik untuk pembuatan QR code penelusuran\.

- `metode_proses` \(ENUM: `NATURAL`, `WASH`, `FULL_WASH`, `WINE`, `HONEY`, `CUSTOM`\) — Metode olah yang diterapkan\.

- `tanggal_mulai_olah` \(DATE\) — Tanggal ceri mulai masuk stasiun pemrosesan/fermentasi\.

- `tanggal_selesai_olah` \(DATE, Nullable\) — Tanggal pengeringan/hulling selesai \(diisi saat proses tamat\)\.

- `total_input_ceri_kg` \(DECIMAL\) — Total akumulasi ceri yang dimasukkan ke batch ini\.

- `berat_green_bean_kg` \(DECIMAL, Nullable\) — Hasil akhir biji kopi kering siap jual \(kg\)\.

- `rendemen_persen` \(DECIMAL, Nullable\) — Persentase hasil akhir dibanding input ceri\.

- `status_proses` \(ENUM: `FERMENTASI`, `PENGERINGAN`, `HULLING_RESTING`, `SELESAI`\) — Status berjalan di lapangan\.



### M3\.3 — Identifikasi Batch Olah \(Batch Tracking\)

Sub\-modul ini mengelompokan riwayat panen dari lahan asal ke batch hasil olah \(Contoh: *Lahan A *$\rightarrow$* Usia 2 Tahun *$\rightarrow$* Batch 1 Normal / Batch 2 Wine*\)\.



**F3\.3\.1 — Pengelompokan Multi\-Panen ke Batch:** Mengabungkan satu atau beberapa log panen \(M3\.1\) ke dalam satu batch olah pascaproses \(M3\.2\)\.

**F3\.3\.2 — Matriks Penelusuran Asal Lahan \(Traceability Matrix\):** Menyajkan silsilah lengkap asal\-usul lahan, varietas, dan riwayat tanah dari suatu `id_batch`\.



**Table: ****`batch_panen_mapping`** *\(Junction Table\)*

- `id_mapping` \(VARCHAR, PK\)

- `id_batch` \(VARCHAR, FK ke `batch_pascaproses`\)

- `id_panen` \(VARCHAR, FK ke `riwayat_panen`\)

- `berat_digunakan_kg` \(DECIMAL\) — Berapa kg ceri dari ID panen tersebut yang dialokasikan ke batch ini\.



## **Modul 4: Autentikasi \& Manajemen Akses**

### M4\.1 — Autentikasi Admin Terproteksi

Sub\-modul ini mengelola proseslLogin terisolasi menggunakan kombinasi username/email dan password hash \(bcrypt\) dengan session JWT\. Hanya dapat diakses oleh role **Super Admin** dan **Admin** internal kelompok tani\.



**F4\.1\.1 — Secure Login \& Session Handling:** Autentikasi pengguna internal menggunakan kredensial terenkripsi dan penerbitan token sesi \(JWT\)\.

**F4\.1\.2 — Role\-Based Access Control \(RBAC\):** Pembatasan hak akses fitur dan data berdasarkan peran penguna \(`SUPER_ADMIN` vs `ADMIN_KELOMPOK_TANI`\)\.

**F4\.1\.3 — Profile \& Password Management:** Mengubah kata sandi dan memperbarui informasi profil pengguna yang sedang login\.



**Tabel: ****`pengguna_admin`** *\(Entitas Baru\)*

- `id_admin` \(VARCHAR, PK\) — Kode unik pengelola \(misal: `ADM-001`\)\.

- `username` \(VARCHAR, UNIQUE\) — Nama pengguna untuk login\.

- `email` \(VARCHAR, UNIQUE\) — Alamat email resmi\.

- `password_hash` \(VARCHAR\) — String hasil enkripsi kata sandi menggunakan algoritma **bcrypt** \(cost factor 10\+\)\. *Catatan: Tidak pernah menyimpan password mentah \(plain text\)\.*

- `nama_lengkap` \(VARCHAR\) — Nama pengelola\.

- `role` \(ENUM: `SUPER_ADMIN`, `ADMIN_KELOMPOK_TANI`\) — Hak akses pengguna\.

- `status_aktif` \(BOOLEAN\) — Penanda akun aktif/dinonaktifkan \(`TRUE`/`FALSE`\)\.

- `last_login_at` \(DATETIME, Nullable\) — Waktu terakhir berhasil login\.





## **ERD**



