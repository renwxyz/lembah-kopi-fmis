CREATE TABLE katalog_metode_pascaproses (
    kode_metode VARCHAR(30) PRIMARY KEY,
    nama_metode VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT,
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_kode_metode_format CHECK (kode_metode ~ '^[A-Z][A-Z0-9_]*$')
);

CREATE TRIGGER update_katalog_metode_pascaproses_modtime
    BEFORE UPDATE ON katalog_metode_pascaproses
    FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();

INSERT INTO katalog_metode_pascaproses (kode_metode, nama_metode, deskripsi)
SELECT metode::text, CASE metode::text
    WHEN 'NATURAL' THEN 'Natural'
    WHEN 'WASH' THEN 'Wash'
    WHEN 'FULL_WASH' THEN 'Full Wash'
    WHEN 'WINE' THEN 'Wine'
    WHEN 'HONEY' THEN 'Honey'
    WHEN 'CUSTOM' THEN 'Custom'
END, CASE metode::text
    WHEN 'CUSTOM' THEN 'Metode kustom yang dapat dikonfigurasi sesuai proses pengolahan.'
    ELSE NULL
END
FROM unnest(enum_range(NULL::enum_metode_proses)) AS metode;

ALTER TABLE batch_pascaproses
    ADD COLUMN estimasi_tanggal_selesai DATE,
    ADD COLUMN target_kadar_air_persen DECIMAL(5, 2)
        CHECK (target_kadar_air_persen BETWEEN 0.00 AND 100.00),
    ADD COLUMN kode_metode_proses VARCHAR(30);

UPDATE batch_pascaproses
SET kode_metode_proses = metode_proses::text;

ALTER TABLE batch_pascaproses
    ALTER COLUMN kode_metode_proses SET NOT NULL,
    ADD CONSTRAINT fk_batch_katalog_metode
        FOREIGN KEY (kode_metode_proses)
        REFERENCES katalog_metode_pascaproses(kode_metode)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    DROP COLUMN metode_proses;

ALTER TABLE batch_pascaproses
    RENAME COLUMN kode_metode_proses TO metode_proses;

DROP TYPE enum_metode_proses;

ALTER TABLE inventaris_tanaman
    ADD CONSTRAINT uq_inventaris_lahan_varietas
        UNIQUE (id_inventaris, id_lahan, varietas);

ALTER TABLE riwayat_panen
    ADD COLUMN id_inventaris VARCHAR(20);

ALTER TABLE riwayat_panen
    ADD CONSTRAINT fk_panen_inventaris_lahan_varietas
        FOREIGN KEY (id_inventaris, id_lahan, varietas)
        REFERENCES inventaris_tanaman (id_inventaris, id_lahan, varietas)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;

CREATE INDEX idx_panen_inventaris
    ON riwayat_panen (id_inventaris)
    WHERE id_inventaris IS NOT NULL;

CREATE TABLE riwayat_tahap_batch (
    id_riwayat_tahap VARCHAR(40) PRIMARY KEY,
    id_batch VARCHAR(30) NOT NULL
        REFERENCES batch_pascaproses(id_batch)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    status_proses enum_status_proses NOT NULL,
    tanggal_perubahan TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    kadar_air_persen DECIMAL(5, 2)
        CHECK (kadar_air_persen BETWEEN 0.00 AND 100.00),
    catatan TEXT,
    id_admin VARCHAR(20)
        REFERENCES pengguna_admin(id_admin)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_riwayat_tahap_batch_waktu
    ON riwayat_tahap_batch (id_batch, tanggal_perubahan DESC, id_riwayat_tahap DESC);

INSERT INTO riwayat_tahap_batch (
    id_riwayat_tahap, id_batch, status_proses, tanggal_perubahan, created_at
)
SELECT
    'LEGACY-' || id_batch, id_batch, status_proses, updated_at, created_at
FROM batch_pascaproses;

ALTER TABLE batch_panen_mapping
    ADD CONSTRAINT ck_mapping_berat_digunakan_positif
        CHECK (berat_digunakan_kg > 0);

CREATE OR REPLACE FUNCTION trg_validate_panen_allocation()
RETURNS TRIGGER AS $$
DECLARE
    available_weight DECIMAL(8, 2);
    already_allocated DECIMAL(12, 2);
BEGIN
    SELECT berat_ceri_kg
    INTO available_weight
    FROM riwayat_panen
    WHERE id_panen = NEW.id_panen
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Harvest record % does not exist', NEW.id_panen
            USING ERRCODE = '23503';
    END IF;

    SELECT COALESCE(SUM(berat_digunakan_kg), 0)
    INTO already_allocated
    FROM batch_panen_mapping
    WHERE id_panen = NEW.id_panen
      AND (TG_OP <> 'UPDATE' OR id_mapping <> OLD.id_mapping);

    IF already_allocated + NEW.berat_digunakan_kg > available_weight THEN
        RAISE EXCEPTION 'Allocation exceeds available harvest weight for %', NEW.id_panen
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_panen_allocation
    BEFORE INSERT OR UPDATE ON batch_panen_mapping
    FOR EACH ROW EXECUTE FUNCTION trg_validate_panen_allocation();

CREATE OR REPLACE FUNCTION trg_validate_panen_weight_change()
RETURNS TRIGGER AS $$
DECLARE
    already_allocated DECIMAL(12, 2);
BEGIN
    IF NEW.berat_ceri_kg IS DISTINCT FROM OLD.berat_ceri_kg THEN
        PERFORM 1 FROM riwayat_panen WHERE id_panen = OLD.id_panen FOR UPDATE;
        SELECT COALESCE(SUM(berat_digunakan_kg), 0)
        INTO already_allocated
        FROM batch_panen_mapping
        WHERE id_panen = OLD.id_panen;

        IF already_allocated > NEW.berat_ceri_kg THEN
            RAISE EXCEPTION 'Harvest weight cannot be lower than its allocated weight'
                USING ERRCODE = '23514';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_panen_weight_change
    BEFORE UPDATE OF berat_ceri_kg ON riwayat_panen
    FOR EACH ROW EXECUTE FUNCTION trg_validate_panen_weight_change();

CREATE OR REPLACE FUNCTION trg_refresh_harvest_allocation_status()
RETURNS TRIGGER AS $$
DECLARE
    affected_harvest_id VARCHAR(20);
    allocated_weight DECIMAL(12, 2);
    harvest_weight DECIMAL(8, 2);
BEGIN
    IF TG_OP <> 'INSERT' THEN
        affected_harvest_id := OLD.id_panen;
        SELECT COALESCE(SUM(berat_digunakan_kg), 0)
        INTO allocated_weight
        FROM batch_panen_mapping
        WHERE id_panen = affected_harvest_id;
        SELECT berat_ceri_kg INTO harvest_weight
        FROM riwayat_panen WHERE id_panen = affected_harvest_id;
        UPDATE riwayat_panen
        SET status_alokasi = CASE
            WHEN allocated_weight = 0 THEN 'UNPROCESSED'::enum_status_alokasi
            WHEN allocated_weight >= harvest_weight THEN 'FULLY_BATCHED'::enum_status_alokasi
            ELSE 'PARTIAL'::enum_status_alokasi
        END
        WHERE id_panen = affected_harvest_id;
    END IF;

    IF TG_OP <> 'DELETE' AND (TG_OP <> 'UPDATE' OR NEW.id_panen IS DISTINCT FROM OLD.id_panen) THEN
        affected_harvest_id := NEW.id_panen;
        SELECT COALESCE(SUM(berat_digunakan_kg), 0)
        INTO allocated_weight
        FROM batch_panen_mapping
        WHERE id_panen = affected_harvest_id;
        SELECT berat_ceri_kg INTO harvest_weight
        FROM riwayat_panen WHERE id_panen = affected_harvest_id;
        UPDATE riwayat_panen
        SET status_alokasi = CASE
            WHEN allocated_weight = 0 THEN 'UNPROCESSED'::enum_status_alokasi
            WHEN allocated_weight >= harvest_weight THEN 'FULLY_BATCHED'::enum_status_alokasi
            ELSE 'PARTIAL'::enum_status_alokasi
        END
        WHERE id_panen = affected_harvest_id;
    ELSIF TG_OP = 'INSERT' THEN
        affected_harvest_id := NEW.id_panen;
        SELECT COALESCE(SUM(berat_digunakan_kg), 0)
        INTO allocated_weight
        FROM batch_panen_mapping
        WHERE id_panen = affected_harvest_id;
        SELECT berat_ceri_kg INTO harvest_weight
        FROM riwayat_panen WHERE id_panen = affected_harvest_id;
        UPDATE riwayat_panen
        SET status_alokasi = CASE
            WHEN allocated_weight = 0 THEN 'UNPROCESSED'::enum_status_alokasi
            WHEN allocated_weight >= harvest_weight THEN 'FULLY_BATCHED'::enum_status_alokasi
            ELSE 'PARTIAL'::enum_status_alokasi
        END
        WHERE id_panen = affected_harvest_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_refresh_batch_input_weight()
RETURNS TRIGGER AS $$
DECLARE
    affected_batch_id VARCHAR(30);
BEGIN
    IF TG_OP <> 'INSERT' THEN
        affected_batch_id := OLD.id_batch;
        UPDATE batch_pascaproses
        SET total_input_ceri_kg = COALESCE((
            SELECT SUM(berat_digunakan_kg)
            FROM batch_panen_mapping WHERE id_batch = affected_batch_id
        ), 0)
        WHERE id_batch = affected_batch_id;
    END IF;

    IF TG_OP <> 'DELETE' AND (TG_OP <> 'UPDATE' OR NEW.id_batch IS DISTINCT FROM OLD.id_batch) THEN
        affected_batch_id := NEW.id_batch;
        UPDATE batch_pascaproses
        SET total_input_ceri_kg = COALESCE((
            SELECT SUM(berat_digunakan_kg)
            FROM batch_panen_mapping WHERE id_batch = affected_batch_id
        ), 0)
        WHERE id_batch = affected_batch_id;
    ELSIF TG_OP = 'INSERT' THEN
        affected_batch_id := NEW.id_batch;
        UPDATE batch_pascaproses
        SET total_input_ceri_kg = COALESCE((
            SELECT SUM(berat_digunakan_kg)
            FROM batch_panen_mapping WHERE id_batch = affected_batch_id
        ), 0)
        WHERE id_batch = affected_batch_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_harvest_allocation_status
    AFTER INSERT OR UPDATE OR DELETE ON batch_panen_mapping
    FOR EACH ROW EXECUTE FUNCTION trg_refresh_harvest_allocation_status();

CREATE TRIGGER refresh_batch_input_weight
    AFTER INSERT OR UPDATE OR DELETE ON batch_panen_mapping
    FOR EACH ROW EXECUTE FUNCTION trg_refresh_batch_input_weight();

CREATE OR REPLACE FUNCTION trg_refresh_status_after_harvest_weight_change()
RETURNS TRIGGER AS $$
DECLARE
    allocated_weight DECIMAL(12, 2);
BEGIN
    SELECT COALESCE(SUM(berat_digunakan_kg), 0)
    INTO allocated_weight
    FROM batch_panen_mapping WHERE id_panen = NEW.id_panen;

    UPDATE riwayat_panen
    SET status_alokasi = CASE
        WHEN allocated_weight = 0 THEN 'UNPROCESSED'::enum_status_alokasi
        WHEN allocated_weight >= NEW.berat_ceri_kg THEN 'FULLY_BATCHED'::enum_status_alokasi
        ELSE 'PARTIAL'::enum_status_alokasi
    END
    WHERE id_panen = NEW.id_panen;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_status_after_harvest_weight_change
    AFTER UPDATE OF berat_ceri_kg ON riwayat_panen
    FOR EACH ROW EXECUTE FUNCTION trg_refresh_status_after_harvest_weight_change();

CREATE OR REPLACE FUNCTION trg_sync_batch_stage()
RETURNS TRIGGER AS $$
DECLARE
    latest_stage riwayat_tahap_batch%ROWTYPE;
BEGIN
    SELECT * INTO latest_stage
    FROM riwayat_tahap_batch
    WHERE id_batch = NEW.id_batch
    ORDER BY tanggal_perubahan DESC, id_riwayat_tahap DESC
    LIMIT 1;

    UPDATE batch_pascaproses
    SET status_proses = latest_stage.status_proses,
        tanggal_selesai_olah = CASE
            WHEN latest_stage.status_proses = 'SELESAI'
                THEN latest_stage.tanggal_perubahan::date
            ELSE NULL
        END
    WHERE id_batch = NEW.id_batch;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_batch_stage
    AFTER INSERT ON riwayat_tahap_batch
    FOR EACH ROW EXECUTE FUNCTION trg_sync_batch_stage();

CREATE OR REPLACE FUNCTION trg_validate_batch_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_proses = 'SELESAI' AND NEW.berat_green_bean_kg IS NULL THEN
        RAISE EXCEPTION 'Final green bean weight is required before completing a batch'
            USING ERRCODE = '23514';
    END IF;
    IF NEW.berat_green_bean_kg IS NOT NULL AND NEW.total_input_ceri_kg <= 0 THEN
        RAISE EXCEPTION 'Batch needs allocated cherry input before recording output'
            USING ERRCODE = '23514';
    END IF;
    IF NEW.berat_green_bean_kg IS NOT NULL THEN
        NEW.rendemen_persen := ROUND(
            NEW.berat_green_bean_kg / NEW.total_input_ceri_kg * 100,
            2
        );
        IF NEW.rendemen_persen > 100 THEN
            RAISE EXCEPTION 'Green bean output cannot exceed cherry input'
                USING ERRCODE = '23514';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_batch_completion
    BEFORE INSERT OR UPDATE OF status_proses, berat_green_bean_kg, total_input_ceri_kg
    ON batch_pascaproses
    FOR EACH ROW EXECUTE FUNCTION trg_validate_batch_completion();

CREATE OR REPLACE FUNCTION trg_recalculate_batch_yield()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.berat_green_bean_kg IS NOT NULL THEN
        NEW.rendemen_persen := ROUND(
            NEW.berat_green_bean_kg / NEW.total_input_ceri_kg * 100,
            2
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_batch_yield
    BEFORE UPDATE OF total_input_ceri_kg ON batch_pascaproses
    FOR EACH ROW EXECUTE FUNCTION trg_recalculate_batch_yield();

CREATE OR REPLACE FUNCTION trg_validate_method_in_use()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.aktif AND NOT NEW.aktif AND EXISTS (
        SELECT 1 FROM batch_pascaproses WHERE metode_proses = OLD.kode_metode
    ) THEN
        RAISE EXCEPTION 'A processing method used by a batch cannot be deactivated'
            USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_method_in_use
    BEFORE UPDATE OF aktif ON katalog_metode_pascaproses
    FOR EACH ROW EXECUTE FUNCTION trg_validate_method_in_use();

UPDATE riwayat_panen AS panen
SET status_alokasi = CASE
    WHEN COALESCE(alokasi.total, 0) = 0 THEN 'UNPROCESSED'::enum_status_alokasi
    WHEN alokasi.total >= panen.berat_ceri_kg THEN 'FULLY_BATCHED'::enum_status_alokasi
    ELSE 'PARTIAL'::enum_status_alokasi
END
FROM (
    SELECT id_panen, SUM(berat_digunakan_kg) AS total
    FROM batch_panen_mapping
    GROUP BY id_panen
) alokasi
WHERE alokasi.id_panen = panen.id_panen;

UPDATE batch_pascaproses AS batch
SET total_input_ceri_kg = COALESCE(alokasi.total, 0)
FROM (
    SELECT id_batch, SUM(berat_digunakan_kg) AS total
    FROM batch_panen_mapping
    GROUP BY id_batch
) alokasi
WHERE alokasi.id_batch = batch.id_batch;
