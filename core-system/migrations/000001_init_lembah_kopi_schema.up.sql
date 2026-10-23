CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE enum_varietas AS ENUM (
    'ROBUSTA',
    'ARABIKA'
);

CREATE TYPE enum_kelompok_usia AS ENUM (
    'LIMA_TAHUN_KURANG',
    'LIMA_BELAS_TAHUN_KURANG',
    'LIMA_BELAS_TAHUN_LEBIH'
);

CREATE TYPE enum_tingkat_serangan AS ENUM (
    'RINGAN',
    'SEDANG',
    'BERAT'
);

CREATE TYPE enum_status_penanganan AS ENUM (
    'TERDETEKSI',
    'DALAM_PENANGANAN',
    'TERKENDALI'
);

CREATE TYPE enum_metode_petik AS ENUM (
    'PETIK_MERAH',
    'PETIK_PELANGI'
);

CREATE TYPE enum_status_alokasi AS ENUM (
    'UNPROCESSED',
    'PARTIAL',
    'FULLY_BATCHED'
);

CREATE TYPE enum_metode_proses AS ENUM (
    'NATURAL',
    'WASH',
    'FULL_WASH',
    'WINE',
    'HONEY',
    'CUSTOM'
);

CREATE TYPE enum_status_proses AS ENUM (
    'FERMENTASI',
    'PENGERINGAN',
    'HULLING_RESTING',
    'SELESAI'
);

CREATE TYPE enum_role_admin AS ENUM (
    'SUPER_ADMIN',
    'ADMIN_KELOMPOK_TANI'
);

CREATE TABLE pengguna_admin (
    id_admin VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    role enum_role_admin NOT NULL,
    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE petani (
    id_petani VARCHAR(20) PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    no_hp VARCHAR(15) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lahan (
    id_lahan VARCHAR(20) PRIMARY KEY,
    id_petani VARCHAR(20) NOT NULL REFERENCES petani(id_petani) ON DELETE RESTRICT ON UPDATE CASCADE,
    nama_petak VARCHAR(50) NOT NULL,
    dusun VARCHAR(50) NOT NULL,
    elevasi_mdpl INT CHECK (elevasi_mdpl >= 0),
    latitude DECIMAL(10, 8) CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(11, 8) CHECK (longitude BETWEEN -180 AND 180),
    polygon_geom GEOMETRY(Polygon, 4326),
    luas_m2 DECIMAL(12, 2) CHECK (luas_m2 >= 0),
    total_pohon INT NOT NULL DEFAULT 0 CHECK (total_pohon >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventaris_tanaman (
    id_inventaris VARCHAR(20) PRIMARY KEY,
    id_lahan VARCHAR(20) NOT NULL REFERENCES lahan(id_lahan) ON DELETE CASCADE ON UPDATE CASCADE,
    varietas enum_varietas NOT NULL,
    jumlah_pohon INT NOT NULL CHECK (jumlah_pohon >= 0),
    kelompok_usia enum_kelompok_usia NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE log_kondisi_tanah (
    id_log_tanah VARCHAR(20) PRIMARY KEY,
    id_lahan VARCHAR(20) NOT NULL REFERENCES lahan(id_lahan) ON DELETE CASCADE ON UPDATE CASCADE,
    tanggal_ukur TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ph_tanah DECIMAL(3, 1) CHECK (ph_tanah BETWEEN 0.0 AND 14.0),
    kelembapan DECIMAL(5, 2) CHECK (kelembapan BETWEEN 0.00 AND 100.00),
    suhu_celsius DECIMAL(4, 1),
    n_value INT CHECK (n_value >= 0),
    p_value INT CHECK (p_value >= 0),
    k_value INT CHECK (k_value >= 0),
    ec_value INT CHECK (ec_value >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE riwayat_pemupukan (
    id_pemupukan VARCHAR(20) PRIMARY KEY,
    id_lahan VARCHAR(20) NOT NULL REFERENCES lahan(id_lahan) ON DELETE CASCADE ON UPDATE CASCADE,
    tanggal_aplikasi DATE NOT NULL,
    jenis_pupuk VARCHAR(100) NOT NULL,
    dosis_kg DECIMAL(8, 2) NOT NULL CHECK (dosis_kg >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE riwayat_hama_penyakit (
    id_insiden VARCHAR(20) PRIMARY KEY,
    id_lahan VARCHAR(20) NOT NULL REFERENCES lahan(id_lahan) ON DELETE CASCADE ON UPDATE CASCADE,
    tanggal_ditemukan DATE NOT NULL,
    jenis_hama_penyakit VARCHAR(100) NOT NULL,
    tingkat_serangan enum_tingkat_serangan NOT NULL,
    tindakan_penanganan TEXT,
    status_penanganan enum_status_penanganan NOT NULL DEFAULT 'TERDETEKSI',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE riwayat_panen (
    id_panen VARCHAR(20) PRIMARY KEY,
    id_lahan VARCHAR(20) NOT NULL REFERENCES lahan(id_lahan) ON DELETE RESTRICT ON UPDATE CASCADE,
    tanggal_panen DATE NOT NULL,
    berat_ceri_kg DECIMAL(8, 2) NOT NULL CHECK (berat_ceri_kg >= 0),
    metode_petik enum_metode_petik NOT NULL,
    varietas enum_varietas NOT NULL,
    status_alokasi enum_status_alokasi NOT NULL DEFAULT 'UNPROCESSED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batch_pascaproses (
    id_batch VARCHAR(30) PRIMARY KEY,
    kode_qr_trace VARCHAR(100) NOT NULL UNIQUE,
    metode_proses enum_metode_proses NOT NULL,
    tanggal_mulai_olah DATE NOT NULL,
    tanggal_selesai_olah DATE,
    total_input_ceri_kg DECIMAL(8, 2) NOT NULL DEFAULT 0.00 CHECK (total_input_ceri_kg >= 0),
    berat_green_bean_kg DECIMAL(8, 2) CHECK (berat_green_bean_kg >= 0),
    rendemen_persen DECIMAL(5, 2) CHECK (rendemen_persen BETWEEN 0.00 AND 100.00),
    status_proses enum_status_proses NOT NULL DEFAULT 'FERMENTASI',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_tanggal_olah CHECK (tanggal_selesai_olah IS NULL OR tanggal_selesai_olah >= tanggal_mulai_olah)
);

CREATE TABLE batch_panen_mapping (
    id_mapping VARCHAR(30) PRIMARY KEY,
    id_batch VARCHAR(30) NOT NULL REFERENCES batch_pascaproses(id_batch) ON DELETE CASCADE ON UPDATE CASCADE,
    id_panen VARCHAR(20) NOT NULL REFERENCES riwayat_panen(id_panen) ON DELETE RESTRICT ON UPDATE CASCADE,
    berat_digunakan_kg DECIMAL(8, 2) NOT NULL CHECK (berat_digunakan_kg > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_batch_panen UNIQUE (id_batch, id_panen)
);

CREATE INDEX idx_lahan_polygon_gist ON lahan USING GIST (polygon_geom);
CREATE INDEX idx_lahan_petani ON lahan (id_petani);
CREATE INDEX idx_log_tanah_lahan_tanggal ON log_kondisi_tanah (id_lahan, tanggal_ukur DESC);
CREATE INDEX idx_pemupukan_lahan ON riwayat_pemupukan (id_lahan, tanggal_aplikasi DESC);
CREATE INDEX idx_hama_lahan ON riwayat_hama_penyakit (id_lahan, status_penanganan);
CREATE INDEX idx_panen_lahan ON riwayat_panen (id_lahan, status_alokasi);
CREATE INDEX idx_batch_qr ON batch_pascaproses (kode_qr_trace);
CREATE INDEX idx_mapping_batch ON batch_panen_mapping (id_batch);
CREATE INDEX idx_mapping_panen ON batch_panen_mapping (id_panen);

CREATE OR REPLACE FUNCTION trg_calculate_lahan_luas()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.polygon_geom IS NOT NULL THEN
        NEW.luas_m2 := ST_Area(NEW.polygon_geom::geography);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_lahan_luas
BEFORE INSERT OR UPDATE OF polygon_geom ON lahan
FOR EACH ROW
EXECUTE FUNCTION trg_calculate_lahan_luas();

CREATE OR REPLACE FUNCTION trg_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pengguna_admin_modtime BEFORE UPDATE ON pengguna_admin FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();
CREATE TRIGGER update_petani_modtime BEFORE UPDATE ON petani FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();
CREATE TRIGGER update_lahan_modtime BEFORE UPDATE ON lahan FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();
CREATE TRIGGER update_inventaris_tanaman_modtime BEFORE UPDATE ON inventaris_tanaman FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();
CREATE TRIGGER update_riwayat_pemupukan_modtime BEFORE UPDATE ON riwayat_pemupukan FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();
CREATE TRIGGER update_riwayat_hama_penyakit_modtime BEFORE UPDATE ON riwayat_hama_penyakit FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();
CREATE TRIGGER update_riwayat_panen_modtime BEFORE UPDATE ON riwayat_panen FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();
CREATE TRIGGER update_batch_pascaproses_modtime BEFORE UPDATE ON batch_pascaproses FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();