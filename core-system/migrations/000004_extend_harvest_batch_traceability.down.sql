DROP TRIGGER IF EXISTS validate_method_in_use ON katalog_metode_pascaproses;
DROP TRIGGER IF EXISTS recalculate_batch_yield ON batch_pascaproses;
DROP TRIGGER IF EXISTS validate_batch_completion ON batch_pascaproses;
DROP TRIGGER IF EXISTS sync_batch_stage ON riwayat_tahap_batch;
DROP TRIGGER IF EXISTS refresh_status_after_harvest_weight_change ON riwayat_panen;
DROP TRIGGER IF EXISTS refresh_batch_input_weight ON batch_panen_mapping;
DROP TRIGGER IF EXISTS refresh_harvest_allocation_status ON batch_panen_mapping;
DROP TRIGGER IF EXISTS validate_panen_weight_change ON riwayat_panen;
DROP TRIGGER IF EXISTS validate_panen_allocation ON batch_panen_mapping;
DROP TRIGGER IF EXISTS update_katalog_metode_pascaproses_modtime ON katalog_metode_pascaproses;

DROP FUNCTION IF EXISTS trg_validate_method_in_use();
DROP FUNCTION IF EXISTS trg_recalculate_batch_yield();
DROP FUNCTION IF EXISTS trg_validate_batch_completion();
DROP FUNCTION IF EXISTS trg_sync_batch_stage();
DROP FUNCTION IF EXISTS trg_refresh_status_after_harvest_weight_change();
DROP FUNCTION IF EXISTS trg_refresh_batch_input_weight();
DROP FUNCTION IF EXISTS trg_refresh_harvest_allocation_status();
DROP FUNCTION IF EXISTS trg_validate_panen_weight_change();
DROP FUNCTION IF EXISTS trg_validate_panen_allocation();

DROP TABLE riwayat_tahap_batch;

ALTER TABLE batch_pascaproses
    DROP CONSTRAINT fk_batch_katalog_metode,
    DROP COLUMN estimasi_tanggal_selesai,
    DROP COLUMN target_kadar_air_persen;

ALTER TABLE batch_pascaproses
    RENAME COLUMN metode_proses TO kode_metode_proses;

CREATE TYPE enum_metode_proses AS ENUM (
    'NATURAL',
    'WASH',
    'FULL_WASH',
    'WINE',
    'HONEY',
    'CUSTOM'
);

ALTER TABLE batch_pascaproses
    ADD COLUMN metode_proses enum_metode_proses;

UPDATE batch_pascaproses
SET metode_proses = kode_metode_proses::enum_metode_proses;

ALTER TABLE batch_pascaproses
    ALTER COLUMN metode_proses SET NOT NULL,
    DROP COLUMN kode_metode_proses;

DROP INDEX idx_panen_inventaris;

ALTER TABLE riwayat_panen
    DROP CONSTRAINT fk_panen_inventaris_lahan_varietas,
    DROP COLUMN id_inventaris;

ALTER TABLE inventaris_tanaman
    DROP CONSTRAINT uq_inventaris_lahan_varietas;

ALTER TABLE batch_panen_mapping
    DROP CONSTRAINT ck_mapping_berat_digunakan_positif;

DROP TABLE katalog_metode_pascaproses;
