-- Community Profile + CMS: konten situs publik (web-compro) yang dikelola dari web-dashboard.

-- Pengaturan situs: tepat satu baris (id = 1) memuat hero, about, dan kontak/footer.
CREATE TABLE IF NOT EXISTS cms_pengaturan_situs (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    hero_judul VARCHAR(120) NOT NULL,
    hero_slogan VARCHAR(200) NOT NULL DEFAULT '',
    hero_foto_key VARCHAR(200),
    nomor_whatsapp VARCHAR(20) NOT NULL DEFAULT '',
    about_cerita TEXT NOT NULL DEFAULT '',
    -- Tepat 3 nilai komunitas: [{"judul": "...", "deskripsi": "..."}, ...]
    about_nilai JSONB NOT NULL DEFAULT '[]'::jsonb,
    alamat TEXT NOT NULL DEFAULT '',
    instagram_url VARCHAR(300) NOT NULL DEFAULT '',
    youtube_url VARCHAR(300) NOT NULL DEFAULT '',
    facebook_url VARCHAR(300) NOT NULL DEFAULT '',
    tiktok_url VARCHAR(300) NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cms_pengaturan_situs (id, hero_judul, hero_slogan, about_cerita, about_nilai, alamat)
VALUES (
    1,
    'Kelompok Tani Lembah Kopi',
    'Kopi lokal dari Desa Glodogan',
    '',
    '[{"judul":"","deskripsi":""},{"judul":"","deskripsi":""},{"judul":"","deskripsi":""}]'::jsonb,
    'Desa Glodogan'
)
ON CONFLICT (id) DO NOTHING;

-- Katalog kopi: etalase tanpa transaksi, pemesanan lewat WhatsApp.
CREATE TABLE IF NOT EXISTS cms_produk_kopi (
    id_produk VARCHAR(30) PRIMARY KEY,
    nama VARCHAR(120) NOT NULL,
    varietas VARCHAR(30) NOT NULL,
    proses VARCHAR(30) NOT NULL,
    foto_key VARCHAR(200),
    status_ketersediaan VARCHAR(20) NOT NULL DEFAULT 'TERSEDIA'
        CHECK (status_ketersediaan IN ('TERSEDIA', 'TERBATAS', 'HABIS')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Embed YouTube / Instagram: hanya menyimpan URL, ID diekstrak oleh backend.
CREATE TABLE IF NOT EXISTS cms_media_embed (
    id_media VARCHAR(30) PRIMARY KEY,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('YOUTUBE', 'INSTAGRAM')),
    url VARCHAR(500) NOT NULL,
    external_id VARCHAR(60) NOT NULL,
    tampil BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Agenda: disembunyikan otomatis di sisi publik setelah tanggalnya lewat (filter saat query).
CREATE TABLE IF NOT EXISTS cms_agenda (
    id_agenda VARCHAR(30) PRIMARY KEY,
    judul VARCHAR(150) NOT NULL,
    tanggal DATE NOT NULL,
    keterangan VARCHAR(300) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cms_agenda_tanggal ON cms_agenda (tanggal);

-- Galeri foto aktivitas tani.
CREATE TABLE IF NOT EXISTS cms_galeri (
    id_foto VARCHAR(30) PRIMARY KEY,
    foto_key VARCHAR(200) NOT NULL,
    keterangan VARCHAR(200) NOT NULL DEFAULT '',
    urutan INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cms_galeri_urutan ON cms_galeri (urutan, created_at DESC);

