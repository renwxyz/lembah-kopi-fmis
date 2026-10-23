package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"lembah-kopi/core-system/internal/domain"
)

type harvestRepository struct{ db *sql.DB }

func NewHarvestRepository(db *sql.DB) domain.HarvestRepository {
	return &harvestRepository{db: db}
}

const harvestColumns = `id_panen, id_lahan, id_inventaris, tanggal_panen, berat_ceri_kg,
	metode_petik, varietas, status_alokasi, created_at, updated_at`

func scanHarvest(scanner interface{ Scan(...any) error }) (domain.HarvestLog, error) {
	var item domain.HarvestLog
	err := scanner.Scan(&item.ID, &item.LandID, &item.InventoryID, &item.HarvestDate,
		&item.CherryWeightKG, &item.PickingMethod, &item.Variety, &item.Allocation,
		&item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (r *harvestRepository) ListByLand(ctx context.Context, landID string, filter domain.HarvestFilter, limit, offset int) ([]domain.HarvestLog, int, error) {
	where := `id_lahan = $1
		AND ($2::date IS NULL OR tanggal_panen >= $2)
		AND ($3::date IS NULL OR tanggal_panen <= $3)
		AND ($4 = '' OR varietas = $4::enum_varietas)
		AND ($5 = '' OR status_alokasi = $5::enum_status_alokasi)`
	args := []any{landID, nullableTime(filter.From), nullableTime(filter.To), filter.Variety, filter.Allocation}
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM riwayat_panen WHERE `+where, args...).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	queryArgs := append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, `SELECT `+harvestColumns+`
		FROM riwayat_panen WHERE `+where+`
		ORDER BY tanggal_panen DESC, id_panen DESC LIMIT $6 OFFSET $7`, queryArgs...)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.HarvestLog, 0)
	for rows.Next() {
		item, err := scanHarvest(rows)
		if err != nil {
			return nil, 0, translateDatabaseError(err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	if total == 0 {
		if err := ensureExists(ctx, r.db, `SELECT id_lahan FROM lahan WHERE id_lahan = $1`, landID); err != nil {
			return nil, 0, err
		}
	}
	return items, total, nil
}

func (r *harvestRepository) Get(ctx context.Context, id string) (*domain.HarvestLog, error) {
	item, err := scanHarvest(r.db.QueryRowContext(ctx, `SELECT `+harvestColumns+`
		FROM riwayat_panen WHERE id_panen = $1`, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &item, nil
}

func (r *harvestRepository) Create(ctx context.Context, item *domain.HarvestLog) error {
	var created domain.HarvestLog
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO riwayat_panen (
			id_panen, id_lahan, id_inventaris, tanggal_panen, berat_ceri_kg, metode_petik, varietas
		)
		SELECT $1, i.id_lahan, i.id_inventaris, $2, $3, $4, i.varietas
		FROM inventaris_tanaman i
		WHERE i.id_inventaris = $5 AND i.id_lahan = $6
		RETURNING `+harvestColumns,
		item.ID, item.HarvestDate, item.CherryWeightKG, item.PickingMethod, *item.InventoryID, item.LandID,
	).Scan(&created.ID, &created.LandID, &created.InventoryID, &created.HarvestDate,
		&created.CherryWeightKG, &created.PickingMethod, &created.Variety, &created.Allocation,
		&created.CreatedAt, &created.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			if err := ensureExists(ctx, r.db, `SELECT id_lahan FROM lahan WHERE id_lahan = $1`, item.LandID); err != nil {
				return err
			}
			return domain.ErrNotFound
		}
		return translateDatabaseError(err)
	}
	*item = created
	return nil
}

func (r *harvestRepository) Update(ctx context.Context, item *domain.HarvestLog) (*domain.HarvestLog, error) {
	row := r.db.QueryRowContext(ctx, `
		UPDATE riwayat_panen
		SET tanggal_panen = $1, berat_ceri_kg = $2, metode_petik = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id_panen = $4
		RETURNING `+harvestColumns,
		item.HarvestDate, item.CherryWeightKG, item.PickingMethod, item.ID)
	updated, err := scanHarvest(row)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	*item = updated
	return &updated, nil
}

func (r *harvestRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM riwayat_panen WHERE id_panen = $1`, id)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

type processingMethodRepository struct{ db *sql.DB }

func NewProcessingMethodRepository(db *sql.DB) domain.ProcessingMethodRepository {
	return &processingMethodRepository{db: db}
}

func (r *processingMethodRepository) List(ctx context.Context, includeInactive bool) ([]domain.ProcessingMethod, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT kode_metode, nama_metode, deskripsi, aktif, created_at, updated_at
		FROM katalog_metode_pascaproses
		WHERE $1 OR aktif
		ORDER BY nama_metode, kode_metode`, includeInactive)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.ProcessingMethod, 0)
	for rows.Next() {
		item, err := scanProcessingMethod(rows)
		if err != nil {
			return nil, translateDatabaseError(err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, translateDatabaseError(err)
	}
	return items, nil
}

func scanProcessingMethod(scanner interface{ Scan(...any) error }) (domain.ProcessingMethod, error) {
	var item domain.ProcessingMethod
	err := scanner.Scan(&item.Code, &item.Name, &item.Description, &item.Active, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (r *processingMethodRepository) Get(ctx context.Context, code string) (*domain.ProcessingMethod, error) {
	item, err := scanProcessingMethod(r.db.QueryRowContext(ctx, `
		SELECT kode_metode, nama_metode, deskripsi, aktif, created_at, updated_at
		FROM katalog_metode_pascaproses WHERE kode_metode = $1`, code))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &item, nil
}

func (r *processingMethodRepository) Create(ctx context.Context, item *domain.ProcessingMethod) error {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO katalog_metode_pascaproses (kode_metode, nama_metode, deskripsi, aktif)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at, updated_at`,
		item.Code, item.Name, item.Description, item.Active).Scan(&item.CreatedAt, &item.UpdatedAt)
	return translateDatabaseError(err)
}

func (r *processingMethodRepository) Update(ctx context.Context, item *domain.ProcessingMethod) (*domain.ProcessingMethod, error) {
	var updated domain.ProcessingMethod
	err := r.db.QueryRowContext(ctx, `
		UPDATE katalog_metode_pascaproses
		SET nama_metode = $1, deskripsi = $2, aktif = $3, updated_at = CURRENT_TIMESTAMP
		WHERE kode_metode = $4
		RETURNING kode_metode, nama_metode, deskripsi, aktif, created_at, updated_at`,
		item.Name, item.Description, item.Active, item.Code,
	).Scan(&updated.Code, &updated.Name, &updated.Description, &updated.Active, &updated.CreatedAt, &updated.UpdatedAt)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	*item = updated
	return &updated, nil
}

func (r *processingMethodRepository) Delete(ctx context.Context, code string) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE katalog_metode_pascaproses SET aktif = FALSE
		WHERE kode_metode = $1 AND aktif`, code)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

type processingBatchRepository struct{ db *sql.DB }

func NewProcessingBatchRepository(db *sql.DB) domain.ProcessingBatchRepository {
	return &processingBatchRepository{db: db}
}

const batchColumns = `id_batch, kode_qr_trace, metode_proses, tanggal_mulai_olah,
	estimasi_tanggal_selesai, tanggal_selesai_olah, target_kadar_air_persen,
	total_input_ceri_kg, berat_green_bean_kg, rendemen_persen, status_proses, created_at, updated_at`

func scanBatch(scanner interface{ Scan(...any) error }) (domain.ProcessingBatch, error) {
	var item domain.ProcessingBatch
	err := scanner.Scan(&item.ID, &item.QRTraceCode, &item.MethodCode, &item.EstimatedStartDate,
		&item.EstimatedCompletion, &item.ActualCompletion, &item.TargetMoisturePercent,
		&item.CherryInputKG, &item.GreenBeanOutputKG, &item.YieldPercent,
		&item.Status, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (r *processingBatchRepository) List(ctx context.Context, filter domain.BatchFilter, limit, offset int) ([]domain.ProcessingBatch, int, error) {
	where := `($1 = '' OR status_proses = $1::enum_status_proses)
		AND ($2 = '' OR metode_proses = $2)`
	args := []any{filter.Status, filter.MethodCode}
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM batch_pascaproses WHERE `+where, args...).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	queryArgs := append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, `SELECT `+batchColumns+` FROM batch_pascaproses
		WHERE `+where+` ORDER BY created_at DESC, id_batch DESC LIMIT $3 OFFSET $4`, queryArgs...)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.ProcessingBatch, 0)
	for rows.Next() {
		item, err := scanBatch(rows)
		if err != nil {
			return nil, 0, translateDatabaseError(err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	return items, total, nil
}

func (r *processingBatchRepository) Get(ctx context.Context, id string) (*domain.ProcessingBatch, error) {
	item, err := scanBatch(r.db.QueryRowContext(ctx, `SELECT `+batchColumns+`
		FROM batch_pascaproses WHERE id_batch = $1`, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &item, nil
}

func (r *processingBatchRepository) Create(ctx context.Context, item *domain.ProcessingBatch) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return translateDatabaseError(err)
	}
	defer tx.Rollback()
	if err := ensureActiveProcessingMethod(ctx, tx, item.MethodCode); err != nil {
		return err
	}
	_, err = tx.ExecContext(ctx, `
		INSERT INTO batch_pascaproses (
			id_batch, kode_qr_trace, metode_proses, tanggal_mulai_olah,
			estimasi_tanggal_selesai, target_kadar_air_persen
		) VALUES ($1, $2, $3, $4, $5, $6)`,
		item.ID, item.QRTraceCode, item.MethodCode, item.EstimatedStartDate,
		item.EstimatedCompletion, item.TargetMoisturePercent)
	if err != nil {
		return translateDatabaseError(err)
	}
	_, err = tx.ExecContext(ctx, `
		INSERT INTO riwayat_tahap_batch (id_riwayat_tahap, id_batch, status_proses, tanggal_perubahan, catatan)
		VALUES ($1, $2, $3, $4, $5)`,
		item.ID+"-INITIAL", item.ID, item.Status, item.EstimatedStartDate, "Tahap awal batch")
	if err != nil {
		return translateDatabaseError(err)
	}
	if err := tx.QueryRowContext(ctx, `SELECT `+batchColumns+`
		FROM batch_pascaproses WHERE id_batch = $1`, item.ID).Scan(
		&item.ID, &item.QRTraceCode, &item.MethodCode, &item.EstimatedStartDate,
		&item.EstimatedCompletion, &item.ActualCompletion, &item.TargetMoisturePercent,
		&item.CherryInputKG, &item.GreenBeanOutputKG, &item.YieldPercent,
		&item.Status, &item.CreatedAt, &item.UpdatedAt); err != nil {
		return translateDatabaseError(err)
	}
	return translateDatabaseError(tx.Commit())
}

func (r *processingBatchRepository) Update(ctx context.Context, item *domain.ProcessingBatch) (*domain.ProcessingBatch, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer tx.Rollback()
	if err := ensureActiveProcessingMethod(ctx, tx, item.MethodCode); err != nil {
		return nil, err
	}
	result, err := tx.ExecContext(ctx, `
		UPDATE batch_pascaproses
		SET metode_proses = $1, tanggal_mulai_olah = $2, estimasi_tanggal_selesai = $3,
			target_kadar_air_persen = $4, berat_green_bean_kg = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id_batch = $6`,
		item.MethodCode, item.EstimatedStartDate, item.EstimatedCompletion,
		item.TargetMoisturePercent, item.GreenBeanOutputKG, item.ID)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	if err := ensureOneRow(result); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, translateDatabaseError(err)
	}
	return r.Get(ctx, item.ID)
}

func ensureActiveProcessingMethod(ctx context.Context, tx *sql.Tx, code string) error {
	var active bool
	err := tx.QueryRowContext(ctx, `
		SELECT aktif FROM katalog_metode_pascaproses
		WHERE kode_metode = $1 FOR SHARE`, code).Scan(&active)
	if err != nil {
		return translateDatabaseError(err)
	}
	if !active {
		return fmt.Errorf("%w: metode pascaproses tidak aktif", domain.ErrConflict)
	}
	return nil
}

func (r *processingBatchRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM batch_pascaproses WHERE id_batch = $1`, id)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func (r *processingBatchRepository) ListStages(ctx context.Context, batchID string, limit, offset int) ([]domain.ProcessingStageRecord, int, error) {
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM riwayat_tahap_batch WHERE id_batch = $1`, batchID).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id_riwayat_tahap, id_batch, status_proses, tanggal_perubahan,
			kadar_air_persen, catatan, id_admin, created_at
		FROM riwayat_tahap_batch WHERE id_batch = $1
		ORDER BY tanggal_perubahan DESC, id_riwayat_tahap DESC
		LIMIT $2 OFFSET $3`, batchID, limit, offset)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.ProcessingStageRecord, 0)
	for rows.Next() {
		var item domain.ProcessingStageRecord
		if err := rows.Scan(&item.ID, &item.BatchID, &item.Status, &item.ChangedAt,
			&item.MoisturePercent, &item.Note, &item.AdminID, &item.CreatedAt); err != nil {
			return nil, 0, translateDatabaseError(err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	if total == 0 {
		if err := ensureExists(ctx, r.db, `SELECT id_batch FROM batch_pascaproses WHERE id_batch = $1`, batchID); err != nil {
			return nil, 0, err
		}
	}
	return items, total, nil
}

func (r *processingBatchRepository) AddStage(ctx context.Context, item *domain.ProcessingStageRecord) error {
	if err := ensureExists(ctx, r.db, `SELECT id_batch FROM batch_pascaproses WHERE id_batch = $1`, item.BatchID); err != nil {
		return err
	}
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO riwayat_tahap_batch (
			id_riwayat_tahap, id_batch, status_proses, tanggal_perubahan, kadar_air_persen, catatan, id_admin
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at`,
		item.ID, item.BatchID, item.Status, item.ChangedAt,
		item.MoisturePercent, item.Note, item.AdminID).Scan(&item.CreatedAt)
	return translateDatabaseError(err)
}

func (r *processingBatchRepository) ListMappings(ctx context.Context, batchID string, limit, offset int) ([]domain.BatchPanenMapping, int, error) {
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM batch_panen_mapping WHERE id_batch = $1`, batchID).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id_mapping, id_batch, id_panen, berat_digunakan_kg, created_at
		FROM batch_panen_mapping WHERE id_batch = $1
		ORDER BY created_at, id_mapping LIMIT $2 OFFSET $3`, batchID, limit, offset)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.BatchPanenMapping, 0)
	for rows.Next() {
		var item domain.BatchPanenMapping
		if err := rows.Scan(&item.ID, &item.BatchID, &item.HarvestID, &item.UsedWeight, &item.CreatedAt); err != nil {
			return nil, 0, translateDatabaseError(err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	if total == 0 {
		if err := ensureExists(ctx, r.db, `SELECT id_batch FROM batch_pascaproses WHERE id_batch = $1`, batchID); err != nil {
			return nil, 0, err
		}
	}
	return items, total, nil
}

func (r *processingBatchRepository) AddMapping(ctx context.Context, item *domain.BatchPanenMapping) error {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO batch_panen_mapping (id_mapping, id_batch, id_panen, berat_digunakan_kg)
		VALUES ($1, $2, $3, $4) RETURNING created_at`,
		item.ID, item.BatchID, item.HarvestID, item.UsedWeight).Scan(&item.CreatedAt)
	return translateDatabaseError(err)
}

func (r *processingBatchRepository) UpdateMapping(ctx context.Context, item *domain.BatchPanenMapping) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE batch_panen_mapping SET berat_digunakan_kg = $1
		WHERE id_mapping = $2 AND id_batch = $3`, item.UsedWeight, item.ID, item.BatchID)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func (r *processingBatchRepository) DeleteMapping(ctx context.Context, batchID, mappingID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM batch_panen_mapping WHERE id_batch = $1 AND id_mapping = $2`, batchID, mappingID)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func (r *processingBatchRepository) GetTraceability(ctx context.Context, batchID string) (*domain.BatchTraceability, error) {
	batch, err := r.Get(ctx, batchID)
	if err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT m.id_mapping, m.id_batch, m.id_panen, m.berat_digunakan_kg, m.created_at,
			p.id_panen, p.id_lahan, p.id_inventaris, p.tanggal_panen, p.berat_ceri_kg,
			p.metode_petik, p.varietas, p.status_alokasi, p.created_at, p.updated_at,
			l.id_lahan, l.id_petani, l.nama_petak, l.dusun, l.elevasi_mdpl, l.latitude, l.longitude, l.luas_m2,
			f.id_petani, f.nama_lengkap, f.no_hp,
			i.id_inventaris, i.kelompok_usia, i.jumlah_pohon
		FROM batch_panen_mapping m
		JOIN riwayat_panen p ON p.id_panen = m.id_panen
		JOIN lahan l ON l.id_lahan = p.id_lahan
		JOIN petani f ON f.id_petani = l.id_petani
		LEFT JOIN inventaris_tanaman i ON i.id_inventaris = p.id_inventaris
		WHERE m.id_batch = $1
		ORDER BY p.tanggal_panen, p.id_panen`, batchID)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer rows.Close()
	result := &domain.BatchTraceability{Batch: *batch, Origins: make([]domain.BatchTraceOrigin, 0)}
	landIDs := make(map[string]struct{})
	for rows.Next() {
		var origin domain.BatchTraceOrigin
		var inventoryID, ageGroup sql.NullString
		var treeCount sql.NullInt64
		if err := rows.Scan(
			&origin.Mapping.ID, &origin.Mapping.BatchID, &origin.Mapping.HarvestID, &origin.Mapping.UsedWeight, &origin.Mapping.CreatedAt,
			&origin.Harvest.ID, &origin.Harvest.LandID, &origin.Harvest.InventoryID, &origin.Harvest.HarvestDate,
			&origin.Harvest.CherryWeightKG, &origin.Harvest.PickingMethod, &origin.Harvest.Variety, &origin.Harvest.Allocation,
			&origin.Harvest.CreatedAt, &origin.Harvest.UpdatedAt,
			&origin.Land.ID, &origin.Land.FarmerID, &origin.Land.PlotName, &origin.Land.Hamlet,
			&origin.Land.ElevationM, &origin.Land.Latitude, &origin.Land.Longitude, &origin.Land.AreaM2,
			&origin.Farmer.ID, &origin.Farmer.FullName, &origin.Farmer.PhoneNumber,
			&inventoryID, &ageGroup, &treeCount,
		); err != nil {
			return nil, translateDatabaseError(err)
		}
		if inventoryID.Valid {
			origin.Inventory = &domain.TraceInventory{
				ID: inventoryID.String, LandID: origin.Harvest.LandID, Variety: origin.Harvest.Variety,
				AgeGroup: domain.PlantAgeGroup(ageGroup.String), TreeCount: int(treeCount.Int64),
			}
		}
		origin.SoilHistory = make([]domain.SoilConditionLog, 0)
		result.Origins = append(result.Origins, origin)
		landIDs[origin.Land.ID] = struct{}{}
	}
	if err := rows.Err(); err != nil {
		return nil, translateDatabaseError(err)
	}
	if len(result.Origins) == 0 {
		return result, nil
	}
	soilRows, err := r.db.QueryContext(ctx, `
		SELECT id_log_tanah, id_lahan, id_pemupukan, tahap_pemantauan, tanggal_ukur,
			ph_tanah, kelembapan, suhu_celsius, n_value, p_value, k_value, ec_value, created_at
		FROM log_kondisi_tanah
		WHERE id_lahan IN (SELECT DISTINCT p.id_lahan
			FROM batch_panen_mapping m JOIN riwayat_panen p ON p.id_panen = m.id_panen
			WHERE m.id_batch = $1)
		ORDER BY tanggal_ukur DESC, id_log_tanah DESC`, batchID)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer soilRows.Close()
	soilByLand := make(map[string][]domain.SoilConditionLog, len(landIDs))
	for soilRows.Next() {
		item, err := scanSoilCondition(soilRows)
		if err != nil {
			return nil, translateDatabaseError(err)
		}
		soilByLand[item.LandID] = append(soilByLand[item.LandID], item)
	}
	if err := soilRows.Err(); err != nil {
		return nil, translateDatabaseError(err)
	}
	for idx := range result.Origins {
		result.Origins[idx].SoilHistory = soilByLand[result.Origins[idx].Land.ID]
	}
	return result, nil
}
