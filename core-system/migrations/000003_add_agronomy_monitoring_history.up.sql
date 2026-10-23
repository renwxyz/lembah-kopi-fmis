CREATE TYPE enum_tahap_pemantauan AS ENUM (
    'SEBELUM',
    'SESUDAH'
);

ALTER TABLE riwayat_pemupukan
    ADD CONSTRAINT uq_pemupukan_id_lahan UNIQUE (id_pemupukan, id_lahan);

ALTER TABLE log_kondisi_tanah
    ADD COLUMN id_pemupukan VARCHAR(20),
    ADD COLUMN tahap_pemantauan enum_tahap_pemantauan,
    ADD CONSTRAINT ck_log_tanah_pemantauan_berpasangan CHECK (
        (id_pemupukan IS NULL AND tahap_pemantauan IS NULL)
        OR (id_pemupukan IS NOT NULL AND tahap_pemantauan IS NOT NULL)
    ),
    ADD CONSTRAINT fk_log_tanah_pemupukan_lahan
        FOREIGN KEY (id_pemupukan, id_lahan)
        REFERENCES riwayat_pemupukan (id_pemupukan, id_lahan)
        ON DELETE NO ACTION
        ON UPDATE CASCADE;

CREATE INDEX idx_log_tanah_pemupukan_tahap_tanggal
    ON log_kondisi_tanah (id_pemupukan, tahap_pemantauan, tanggal_ukur DESC)
    WHERE id_pemupukan IS NOT NULL;

CREATE TABLE riwayat_penanganan_hama_penyakit (
    id_riwayat_penanganan VARCHAR(40) PRIMARY KEY,
    id_insiden VARCHAR(20) NOT NULL
        REFERENCES riwayat_hama_penyakit(id_insiden)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    tanggal_penanganan TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tindakan_penanganan TEXT,
    status_penanganan enum_status_penanganan NOT NULL,
    id_admin VARCHAR(20)
        REFERENCES pengguna_admin(id_admin)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_penanganan_insiden_tanggal
    ON riwayat_penanganan_hama_penyakit
        (id_insiden, tanggal_penanganan DESC, id_riwayat_penanganan DESC);

-- Preserve each incident's latest known treatment/status as a baseline event.
-- Earlier transitions cannot be reconstructed from the legacy columns.
INSERT INTO riwayat_penanganan_hama_penyakit (
    id_riwayat_penanganan,
    id_insiden,
    tanggal_penanganan,
    tindakan_penanganan,
    status_penanganan,
    created_at
)
SELECT
    'LEGACY-' || id_insiden,
    id_insiden,
    updated_at,
    tindakan_penanganan,
    status_penanganan,
    created_at
FROM riwayat_hama_penyakit;

ALTER TABLE riwayat_hama_penyakit
    DROP COLUMN tindakan_penanganan,
    DROP COLUMN status_penanganan;
