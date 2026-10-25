# Entity Relationship Diagram

ERD ini mengikuti schema hasil penerapan berurutan migration `000001`, `000002`
(seed data), `000003`, dan `000004`. Migration `000003` menambahkan hubungan
pengukuran tanah dengan pemupukan serta histori penanganan hama/penyakit;
`000004` menambahkan katalog metode pascaproses, alokasi panen yang terlacak,
target batch, dan histori tahapan pengolahan.

```mermaid
erDiagram
    PENGGUNA_ADMIN {
        varchar id_admin PK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar nama_lengkap
        enum_role_admin role
        boolean status_aktif
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    PETANI {
        varchar id_petani PK
        varchar nama_lengkap
        varchar no_hp
        timestamptz created_at
        timestamptz updated_at
    }

    LAHAN {
        varchar id_lahan PK
        varchar id_petani FK
        varchar nama_petak
        varchar dusun
        int elevasi_mdpl
        decimal latitude
        decimal longitude
        geometry polygon_geom
        decimal luas_m2
        int total_pohon
        timestamptz created_at
        timestamptz updated_at
    }

    INVENTARIS_TANAMAN {
        varchar id_inventaris PK
        varchar id_lahan FK
        enum_varietas varietas
        int jumlah_pohon
        enum_kelompok_usia kelompok_usia
        timestamptz created_at
        timestamptz updated_at
    }

    LOG_KONDISI_TANAH {
        varchar id_log_tanah PK
        varchar id_lahan FK
        varchar id_pemupukan FK
        enum_tahap_pemantauan tahap_pemantauan
        timestamptz tanggal_ukur
        decimal ph_tanah
        decimal kelembapan
        decimal suhu_celsius
        int n_value
        int p_value
        int k_value
        int ec_value
        timestamptz created_at
    }

    RIWAYAT_PEMUPUKAN {
        varchar id_pemupukan PK
        varchar id_lahan FK
        date tanggal_aplikasi
        varchar jenis_pupuk
        decimal dosis_kg
        timestamptz created_at
        timestamptz updated_at
    }

    RIWAYAT_HAMA_PENYAKIT {
        varchar id_insiden PK
        varchar id_lahan FK
        date tanggal_ditemukan
        varchar jenis_hama_penyakit
        enum_tingkat_serangan tingkat_serangan
        timestamptz created_at
        timestamptz updated_at
    }

    RIWAYAT_PENANGANAN_HAMA_PENYAKIT {
        varchar id_riwayat_penanganan PK
        varchar id_insiden FK
        timestamptz tanggal_penanganan
        text tindakan_penanganan
        enum_status_penanganan status_penanganan
        varchar id_admin FK
        timestamptz created_at
    }

    RIWAYAT_PANEN {
        varchar id_panen PK
        varchar id_lahan FK
        varchar id_inventaris FK
        date tanggal_panen
        decimal berat_ceri_kg
        enum_metode_petik metode_petik
        enum_varietas varietas
        enum_status_alokasi status_alokasi
        timestamptz created_at
        timestamptz updated_at
    }

    BATCH_PASCAPROSES {
        varchar id_batch PK
        varchar kode_qr_trace UK
        varchar metode_proses FK
        date tanggal_mulai_olah
        date estimasi_tanggal_selesai
        date tanggal_selesai_olah
        decimal target_kadar_air_persen
        decimal total_input_ceri_kg
        decimal berat_green_bean_kg
        decimal rendemen_persen
        enum_status_proses status_proses
        timestamptz created_at
        timestamptz updated_at
    }

    KATALOG_METODE_PASCAPROSES {
        varchar kode_metode PK
        varchar nama_metode UK
        text deskripsi
        boolean aktif
        timestamptz created_at
        timestamptz updated_at
    }

    RIWAYAT_TAHAP_BATCH {
        varchar id_riwayat_tahap PK
        varchar id_batch FK
        enum_status_proses status_proses
        timestamptz tanggal_perubahan
        decimal kadar_air_persen
        text catatan
        varchar id_admin FK
        timestamptz created_at
    }

    BATCH_PANEN_MAPPING {
        varchar id_mapping PK
        varchar id_batch FK
        varchar id_panen FK
        decimal berat_digunakan_kg
        timestamptz created_at
    }

    PETANI ||--o{ LAHAN : memiliki
    LAHAN ||--o{ INVENTARIS_TANAMAN : memiliki
    LAHAN ||--o{ LOG_KONDISI_TANAH : diukur
    LAHAN ||--o{ RIWAYAT_PEMUPUKAN : menerima
    RIWAYAT_PEMUPUKAN o|--o{ LOG_KONDISI_TANAH : dipantau
    LAHAN ||--o{ RIWAYAT_HAMA_PENYAKIT : terdampak
    RIWAYAT_HAMA_PENYAKIT ||--o{ RIWAYAT_PENANGANAN_HAMA_PENYAKIT : memiliki_histori
    PENGGUNA_ADMIN o|--o{ RIWAYAT_PENANGANAN_HAMA_PENYAKIT : mencatat
    LAHAN ||--o{ RIWAYAT_PANEN : menghasilkan
    INVENTARIS_TANAMAN o|--o{ RIWAYAT_PANEN : sumber_varietas_dan_usia
    KATALOG_METODE_PASCAPROSES ||--o{ BATCH_PASCAPROSES : menentukan
    BATCH_PASCAPROSES ||--o{ RIWAYAT_TAHAP_BATCH : memiliki_histori
    PENGGUNA_ADMIN o|--o{ RIWAYAT_TAHAP_BATCH : mencatat
    BATCH_PASCAPROSES ||--o{ BATCH_PANEN_MAPPING : menggunakan
    RIWAYAT_PANEN ||--o{ BATCH_PANEN_MAPPING : dialokasikan
```

## Catatan relasi dan histori

- `LOG_KONDISI_TANAH.id_pemupukan` dan `tahap_pemantauan` harus sama-sama
  kosong untuk pengukuran umum, atau sama-sama berisi untuk monitoring
  `SEBELUM`/`SESUDAH`.
- Foreign key komposit `(id_pemupukan, id_lahan)` memastikan pengukuran hanya
  dapat dikaitkan dengan aplikasi pemupukan pada lahan yang sama.
- Log pemantauan membatasi penghapusan aplikasi pemupukan yang masih dirujuk.
  Penghapusan lahan tetap menghapus data turunannya sesuai foreign key lahan.
- Setiap perubahan penanganan disimpan sebagai baris baru. Status terkini
  ditentukan dari catatan dengan `tanggal_penanganan` terbaru, lalu
  `id_riwayat_penanganan` sebagai pemecah seri yang deterministik.
- `id_admin` pada catatan penanganan bersifat opsional. Menghapus akun admin
  mempertahankan catatan dan mengosongkan referensi admin.
- Migration `000003` membentuk satu catatan baseline dari nilai tindakan/status
  lama untuk setiap insiden. Waktu baseline memakai `updated_at` lama sebagai
  waktu terakhir yang diketahui; histori perubahan sebelumnya tidak dapat
  dipulihkan dari schema lama.
- Rollback `000003` memulihkan tindakan/status terbaru ke tabel insiden dan
  menghapus tabel histori baru. Catatan tambahan yang dibuat setelah migration
  tidak dapat dipertahankan dalam schema lama.
- Migration `000004` menambahkan katalog metode pascaproses dinamis dan
  memigrasikan nilai enum lama menjadi baris katalog. `metode_proses` pada
  batch menyimpan `kode_metode` yang menjadi foreign key.
- `riwayat_panen.id_inventaris` nullable untuk menjaga kompatibilitas data
  panen lama. Panen baru di API wajib menunjuk inventaris sehingga varietas dan
  kelompok usia bisa ditelusuri ke batch.
- `riwayat_tahap_batch` menyimpan setiap perubahan status dan pengukuran kadar
  air. Status pada batch merupakan status terkini yang disinkronkan dari event
  tahap terbaru.
- Total alokasi satu panen tidak boleh melebihi berat panen. Trigger menjaga
  `status_alokasi` dan `total_input_ceri_kg` tetap sinkron terhadap mapping.
  Berat green bean dan rendemen dihitung serta dibatasi saat hasil akhir dicatat.
- Rollback `000004` akan membuang katalog metode, histori tahap batch, target
  proses, tautan inventaris panen, dan aturan alokasi baru; backup sebelum
  rollback tetap disarankan.

## Schema Community Profile & CMS (`000006`)

Migration `000006` menambahkan tabel independen untuk mengelola publikasi profil kelompok tani dan katalog pameran kopi publik:

```mermaid
erDiagram
    CMS_PENGATURAN_SITUS {
        smallint id PK
        varchar hero_judul
        varchar hero_slogan
        varchar hero_foto_key
        varchar nomor_whatsapp
        text about_cerita
        jsonb about_nilai
        text alamat
        varchar instagram_url
        varchar youtube_url
        varchar facebook_url
        varchar tiktok_url
        timestamptz updated_at
    }

    CMS_PRODUK_KOPI {
        varchar id_produk PK
        varchar nama
        varchar varietas
        varchar proses
        varchar foto_key
        varchar status_ketersediaan
        timestamptz created_at
        timestamptz updated_at
    }

    CMS_MEDIA_EMBED {
        varchar id_media PK
        varchar tipe
        varchar url
        varchar external_id
        boolean tampil
        timestamptz created_at
        timestamptz updated_at
    }

    CMS_AGENDA {
        varchar id_agenda PK
        varchar judul
        date tanggal
        varchar keterangan
        timestamptz created_at
        timestamptz updated_at
    }

    CMS_GALERI {
        varchar id_foto PK
        varchar foto_key
        varchar keterangan
        int urutan
        timestamptz created_at
        timestamptz updated_at
    }
```

