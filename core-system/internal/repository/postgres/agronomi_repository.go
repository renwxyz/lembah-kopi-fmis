package postgres

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

type soilConditionRepository struct {
	db *sql.DB
}

func NewSoilConditionRepository(db *sql.DB) domain.SoilConditionRepository {
	return &soilConditionRepository{db: db}
}

func (r *soilConditionRepository) ListByLand(ctx context.Context, landID string, filter domain.SoilConditionFilter, limit, offset int) ([]domain.SoilConditionLog, int, error) {
	if err := ensureExists(ctx, r.db, `SELECT id_lahan FROM lahan WHERE id_lahan = $1`, landID); err != nil {
		return nil, 0, err
	}
	where := `id_lahan = $1
		AND ($2 = '' OR id_pemupukan = $2)
		AND ($3 = '' OR tahap_pemantauan = $3::enum_tahap_pemantauan)
		AND ($4::timestamptz IS NULL OR tanggal_ukur >= $4)
		AND ($5::timestamptz IS NULL OR tanggal_ukur <= $5)`
	args := []any{landID, filter.FertilizerID, filter.MonitoringStep, nullableTime(filter.From), nullableTime(filter.To)}
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM log_kondisi_tanah WHERE `+where, args...).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	queryArgs := append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, `
		SELECT id_log_tanah, id_lahan, id_pemupukan, tahap_pemantauan, tanggal_ukur,
			ph_tanah, kelembapan, suhu_celsius, n_value, p_value, k_value, ec_value, created_at
		FROM log_kondisi_tanah
		WHERE `+where+`
		ORDER BY tanggal_ukur DESC, id_log_tanah DESC
		LIMIT $6 OFFSET $7`, queryArgs...)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.SoilConditionLog, 0)
	for rows.Next() {
		item, err := scanSoilCondition(rows)
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

func (r *soilConditionRepository) Get(ctx context.Context, id string) (*domain.SoilConditionLog, error) {
	item, err := scanSoilCondition(r.db.QueryRowContext(ctx, `
		SELECT id_log_tanah, id_lahan, id_pemupukan, tahap_pemantauan, tanggal_ukur,
			ph_tanah, kelembapan, suhu_celsius, n_value, p_value, k_value, ec_value, created_at
		FROM log_kondisi_tanah WHERE id_log_tanah = $1`, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &item, nil
}

func (r *soilConditionRepository) Create(ctx context.Context, item *domain.SoilConditionLog) error {
	if err := ensureExists(ctx, r.db, `SELECT id_lahan FROM lahan WHERE id_lahan = $1`, item.LandID); err != nil {
		return err
	}
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO log_kondisi_tanah (
			id_log_tanah, id_lahan, id_pemupukan, tahap_pemantauan, tanggal_ukur,
			ph_tanah, kelembapan, suhu_celsius, n_value, p_value, k_value, ec_value
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING created_at`,
		item.ID, item.LandID, item.FertilizerID, item.MonitoringStep, item.MeasuredAt,
		item.SoilPH, item.Moisture, item.TemperatureC, item.Nitrogen, item.Phosphorus,
		item.Potassium, item.Conductivity,
	).Scan(&item.CreatedAt)
	return translateDatabaseError(err)
}

type fertilizationRepository struct {
	db *sql.DB
}

func NewFertilizationRepository(db *sql.DB) domain.FertilizationRepository {
	return &fertilizationRepository{db: db}
}

func (r *fertilizationRepository) ListByLand(ctx context.Context, landID string, limit, offset int) ([]domain.Fertilization, int, error) {
	if err := ensureExists(ctx, r.db, `SELECT id_lahan FROM lahan WHERE id_lahan = $1`, landID); err != nil {
		return nil, 0, err
	}
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM riwayat_pemupukan WHERE id_lahan = $1`, landID).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id_pemupukan, id_lahan, tanggal_aplikasi, jenis_pupuk, dosis_kg, created_at, updated_at
		FROM riwayat_pemupukan WHERE id_lahan = $1
		ORDER BY tanggal_aplikasi DESC, id_pemupukan DESC LIMIT $2 OFFSET $3`,
		landID, limit, offset)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.Fertilization, 0)
	for rows.Next() {
		var item domain.Fertilization
		if err := rows.Scan(&item.ID, &item.LandID, &item.AppliedAt, &item.Fertilizer, &item.DoseKG, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, 0, translateDatabaseError(err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	return items, total, nil
}

func (r *fertilizationRepository) Get(ctx context.Context, id string) (*domain.Fertilization, error) {
	var item domain.Fertilization
	err := r.db.QueryRowContext(ctx, `
		SELECT id_pemupukan, id_lahan, tanggal_aplikasi, jenis_pupuk, dosis_kg, created_at, updated_at
		FROM riwayat_pemupukan WHERE id_pemupukan = $1`, id,
	).Scan(&item.ID, &item.LandID, &item.AppliedAt, &item.Fertilizer, &item.DoseKG, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &item, nil
}

func (r *fertilizationRepository) Create(ctx context.Context, item *domain.Fertilization) error {
	if err := ensureExists(ctx, r.db, `SELECT id_lahan FROM lahan WHERE id_lahan = $1`, item.LandID); err != nil {
		return err
	}
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO riwayat_pemupukan (id_pemupukan, id_lahan, tanggal_aplikasi, jenis_pupuk, dosis_kg)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at`,
		item.ID, item.LandID, item.AppliedAt, item.Fertilizer, item.DoseKG,
	).Scan(&item.CreatedAt, &item.UpdatedAt)
	return translateDatabaseError(err)
}

func (r *fertilizationRepository) Update(ctx context.Context, item *domain.Fertilization) (*domain.Fertilization, error) {
	var updated domain.Fertilization
	err := r.db.QueryRowContext(ctx, `
		UPDATE riwayat_pemupukan
		SET tanggal_aplikasi = $1, jenis_pupuk = $2, dosis_kg = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id_pemupukan = $4 AND ($5 = '' OR id_lahan = $5)
		RETURNING id_pemupukan, id_lahan, tanggal_aplikasi, jenis_pupuk, dosis_kg, created_at, updated_at`,
		item.AppliedAt, item.Fertilizer, item.DoseKG, item.ID, item.LandID,
	).Scan(&updated.ID, &updated.LandID, &updated.AppliedAt, &updated.Fertilizer, &updated.DoseKG, &updated.CreatedAt, &updated.UpdatedAt)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	*item = updated
	return &updated, nil
}

func (r *fertilizationRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM riwayat_pemupukan WHERE id_pemupukan = $1`, id)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

type pestDiseaseRepository struct {
	db *sql.DB
}

func NewPestDiseaseRepository(db *sql.DB) domain.PestDiseaseRepository {
	return &pestDiseaseRepository{db: db}
}

const incidentColumns = `
	i.id_insiden, i.id_lahan, i.tanggal_ditemukan, i.jenis_hama_penyakit, i.tingkat_serangan,
	COALESCE(t.status_penanganan, 'TERDETEKSI'::enum_status_penanganan),
	t.id_riwayat_penanganan, t.tanggal_penanganan, t.tindakan_penanganan,
	t.status_penanganan, t.id_admin, t.created_at, i.created_at, i.updated_at`

const latestTreatmentJoin = `
	LEFT JOIN LATERAL (
		SELECT id_riwayat_penanganan, tanggal_penanganan, tindakan_penanganan,
			status_penanganan, id_admin, created_at
		FROM riwayat_penanganan_hama_penyakit
		WHERE id_insiden = i.id_insiden
		ORDER BY tanggal_penanganan DESC, id_riwayat_penanganan DESC
		LIMIT 1
	) t ON TRUE`

func (r *pestDiseaseRepository) ListByLand(ctx context.Context, landID string, filter domain.IncidentFilter, limit, offset int) ([]domain.PestDiseaseIncident, int, error) {
	if err := ensureExists(ctx, r.db, `SELECT id_lahan FROM lahan WHERE id_lahan = $1`, landID); err != nil {
		return nil, 0, err
	}
	where := `i.id_lahan = $1
		AND ($2 = '' OR COALESCE(t.status_penanganan, 'TERDETEKSI'::enum_status_penanganan)::text = $2)
		AND ($3 = '' OR i.tingkat_serangan::text = $3)
		AND ($4::date IS NULL OR i.tanggal_ditemukan >= $4)
		AND ($5::date IS NULL OR i.tanggal_ditemukan <= $5)`
	args := []any{landID, filter.Status, filter.Severity, nullableTime(filter.From), nullableTime(filter.To)}
	var total int
	if err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM riwayat_hama_penyakit i `+latestTreatmentJoin+` WHERE `+where, args...).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	queryArgs := append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, `
		SELECT `+incidentColumns+`
		FROM riwayat_hama_penyakit i `+latestTreatmentJoin+`
		WHERE `+where+`
		ORDER BY i.tanggal_ditemukan DESC, i.id_insiden DESC
		LIMIT $6 OFFSET $7`, queryArgs...)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.PestDiseaseIncident, 0)
	for rows.Next() {
		item, err := scanIncident(rows)
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

func (r *pestDiseaseRepository) Get(ctx context.Context, id string) (*domain.PestDiseaseIncident, error) {
	item, err := scanIncident(r.db.QueryRowContext(ctx, `
		SELECT `+incidentColumns+`
		FROM riwayat_hama_penyakit i `+latestTreatmentJoin+`
		WHERE i.id_insiden = $1`, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &item, nil
}

func (r *pestDiseaseRepository) Create(ctx context.Context, item *domain.PestDiseaseIncident) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return translateDatabaseError(err)
	}
	defer tx.Rollback()
	if err := ensureExists(ctx, tx, `SELECT id_lahan FROM lahan WHERE id_lahan = $1`, item.LandID); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO riwayat_hama_penyakit (id_insiden, id_lahan, tanggal_ditemukan, jenis_hama_penyakit, tingkat_serangan)
		VALUES ($1, $2, $3, $4, $5)`,
		item.ID, item.LandID, item.FoundAt, item.PestDisease, item.Severity); err != nil {
		return translateDatabaseError(err)
	}
	baselineID := "BASE-" + item.ID
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO riwayat_penanganan_hama_penyakit
			(id_riwayat_penanganan, id_insiden, tanggal_penanganan, status_penanganan)
		VALUES ($1, $2, CURRENT_TIMESTAMP, $3)`, baselineID, item.ID, domain.StatusTerdeteksi); err != nil {
		return translateDatabaseError(err)
	}
	return translateDatabaseError(tx.Commit())
}

func (r *pestDiseaseRepository) Update(ctx context.Context, item *domain.PestDiseaseIncident) (*domain.PestDiseaseIncident, error) {
	result, err := r.db.ExecContext(ctx, `
		UPDATE riwayat_hama_penyakit
		SET tanggal_ditemukan = $1, jenis_hama_penyakit = $2, tingkat_serangan = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id_insiden = $4 AND ($5 = '' OR id_lahan = $5)`,
		item.FoundAt, item.PestDisease, item.Severity, item.ID, item.LandID)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	if err := ensureOneRow(result); err != nil {
		return nil, err
	}
	return r.Get(ctx, item.ID)
}

func (r *pestDiseaseRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM riwayat_hama_penyakit WHERE id_insiden = $1`, id)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func (r *pestDiseaseRepository) ListTreatments(ctx context.Context, incidentID string, limit, offset int) ([]domain.TreatmentRecord, int, error) {
	if err := ensureExists(ctx, r.db, `SELECT id_insiden FROM riwayat_hama_penyakit WHERE id_insiden = $1`, incidentID); err != nil {
		return nil, 0, err
	}
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM riwayat_penanganan_hama_penyakit WHERE id_insiden = $1`, incidentID).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id_riwayat_penanganan, id_insiden, tanggal_penanganan, tindakan_penanganan, status_penanganan, id_admin, created_at
		FROM riwayat_penanganan_hama_penyakit
		WHERE id_insiden = $1
		ORDER BY tanggal_penanganan DESC, id_riwayat_penanganan DESC
		LIMIT $2 OFFSET $3`, incidentID, limit, offset)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.TreatmentRecord, 0)
	for rows.Next() {
		item, err := scanTreatment(rows)
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

func (r *pestDiseaseRepository) AddTreatment(ctx context.Context, item *domain.TreatmentRecord) error {
	if err := ensureExists(ctx, r.db, `SELECT id_insiden FROM riwayat_hama_penyakit WHERE id_insiden = $1`, item.IncidentID); err != nil {
		return err
	}
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO riwayat_penanganan_hama_penyakit (
			id_riwayat_penanganan, id_insiden, tanggal_penanganan, tindakan_penanganan, status_penanganan, id_admin
		) VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at`,
		item.ID, item.IncidentID, item.TreatedAt, item.Action, item.Status, item.AdminID,
	).Scan(&item.CreatedAt)
	return translateDatabaseError(err)
}

func scanSoilCondition(row rowScanner) (domain.SoilConditionLog, error) {
	var item domain.SoilConditionLog
	var fertilizerID, monitoringStep sql.NullString
	var ph, moisture, temperature sql.NullFloat64
	var nitrogen, phosphorus, potassium, conductivity sql.NullInt64
	err := row.Scan(
		&item.ID, &item.LandID, &fertilizerID, &monitoringStep, &item.MeasuredAt,
		&ph, &moisture, &temperature, &nitrogen, &phosphorus, &potassium, &conductivity, &item.CreatedAt,
	)
	if err != nil {
		return item, err
	}
	item.FertilizerID = nullableString(fertilizerID)
	if monitoringStep.Valid {
		step := domain.TahapPemantauan(monitoringStep.String)
		item.MonitoringStep = &step
	}
	item.SoilPH = nullableFloat(ph)
	item.Moisture = nullableFloat(moisture)
	item.TemperatureC = nullableFloat(temperature)
	item.Nitrogen = nullableInt(nitrogen)
	item.Phosphorus = nullableInt(phosphorus)
	item.Potassium = nullableInt(potassium)
	item.Conductivity = nullableInt(conductivity)
	return item, nil
}

func scanIncident(row rowScanner) (domain.PestDiseaseIncident, error) {
	var item domain.PestDiseaseIncident
	var treatmentID, action, adminID sql.NullString
	var treatmentAt, treatmentCreatedAt sql.NullTime
	var treatmentStatus sql.NullString
	err := row.Scan(
		&item.ID, &item.LandID, &item.FoundAt, &item.PestDisease, &item.Severity, &item.CurrentStatus,
		&treatmentID, &treatmentAt, &action, &treatmentStatus, &adminID, &treatmentCreatedAt,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return item, err
	}
	if treatmentID.Valid {
		status := domain.StatusPenanganan(treatmentStatus.String)
		item.LatestTreatment = &domain.TreatmentRecord{
			ID: treatmentID.String, IncidentID: item.ID, TreatedAt: treatmentAt.Time,
			Action: nullableString(action), Status: status, AdminID: nullableString(adminID),
			CreatedAt: treatmentCreatedAt.Time,
		}
	}
	return item, nil
}

func scanTreatment(row rowScanner) (domain.TreatmentRecord, error) {
	var item domain.TreatmentRecord
	var action, adminID sql.NullString
	err := row.Scan(&item.ID, &item.IncidentID, &item.TreatedAt, &action, &item.Status, &adminID, &item.CreatedAt)
	if err != nil {
		return item, err
	}
	item.Action = nullableString(action)
	item.AdminID = nullableString(adminID)
	return item, nil
}

func ensureExists(ctx context.Context, queryer interface {
	QueryRowContext(context.Context, string, ...any) *sql.Row
}, query string, id string) error {
	var found string
	if err := queryer.QueryRowContext(ctx, query, id).Scan(&found); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.ErrNotFound
		}
		return translateDatabaseError(err)
	}
	return nil
}

func nullableTime(value *time.Time) any {
	if value == nil {
		return nil
	}
	return *value
}

func nullableString(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	result := value.String
	return &result
}

func nullableFloat(value sql.NullFloat64) *float64 {
	if !value.Valid {
		return nil
	}
	result := value.Float64
	return &result
}

func nullableInt(value sql.NullInt64) *int {
	if !value.Valid {
		return nil
	}
	result := int(value.Int64)
	return &result
}
