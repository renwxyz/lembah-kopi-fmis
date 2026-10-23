ALTER TABLE riwayat_hama_penyakit
    ADD COLUMN tindakan_penanganan TEXT,
    ADD COLUMN status_penanganan enum_status_penanganan NOT NULL DEFAULT 'TERDETEKSI';

UPDATE riwayat_hama_penyakit AS insiden
SET
    tindakan_penanganan = penanganan.tindakan_penanganan,
    status_penanganan = COALESCE(penanganan.status_penanganan, insiden.status_penanganan)
FROM (
    SELECT DISTINCT ON (id_insiden)
        id_insiden,
        tindakan_penanganan,
        status_penanganan
    FROM riwayat_penanganan_hama_penyakit
    ORDER BY id_insiden, tanggal_penanganan DESC, id_riwayat_penanganan DESC
) AS penanganan
WHERE insiden.id_insiden = penanganan.id_insiden;

DROP TABLE riwayat_penanganan_hama_penyakit;

DROP INDEX idx_log_tanah_pemupukan_tahap_tanggal;

ALTER TABLE log_kondisi_tanah
    DROP CONSTRAINT fk_log_tanah_pemupukan_lahan,
    DROP CONSTRAINT ck_log_tanah_pemantauan_berpasangan,
    DROP COLUMN tahap_pemantauan,
    DROP COLUMN id_pemupukan;

ALTER TABLE riwayat_pemupukan
    DROP CONSTRAINT uq_pemupukan_id_lahan;

DROP TYPE enum_tahap_pemantauan;
