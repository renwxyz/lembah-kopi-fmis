package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"lembah-kopi/core-system/internal/domain"
)

type landRepository struct {
	db *sql.DB
}

func NewLandRepository(db *sql.DB) domain.LandRepository {
	return &landRepository{db: db}
}

const landColumns = `
	id_lahan, id_petani, nama_petak, dusun, elevasi_mdpl, latitude, longitude,
	ST_AsGeoJSON(polygon_geom), luas_m2, total_pohon, created_at, updated_at`

func (r *landRepository) List(ctx context.Context, farmerID, search string, limit, offset int) ([]domain.Land, int, error) {
	pattern := "%" + search + "%"
	var total int
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM lahan
		WHERE ($1 = '' OR id_petani = $1)
		AND (nama_petak ILIKE $2 OR dusun ILIKE $2)`, farmerID, pattern).Scan(&total)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT `+landColumns+` FROM lahan
		WHERE ($1 = '' OR id_petani = $1)
		AND (nama_petak ILIKE $2 OR dusun ILIKE $2)
		ORDER BY nama_petak, id_lahan
		LIMIT $3 OFFSET $4`, farmerID, pattern, limit, offset)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.Land, 0)
	for rows.Next() {
		land, err := scanLand(rows)
		if err != nil {
			return nil, 0, translateDatabaseError(err)
		}
		items = append(items, *land)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	return items, total, nil
}

func (r *landRepository) Get(ctx context.Context, id string) (*domain.Land, error) {
	land, err := scanLand(r.db.QueryRowContext(ctx, `SELECT `+landColumns+` FROM lahan WHERE id_lahan = $1`, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return land, nil
}

func (r *landRepository) Create(ctx context.Context, land *domain.Land) error {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO lahan (id_lahan, id_petani, nama_petak, dusun, elevasi_mdpl, latitude, longitude, total_pohon)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
		RETURNING created_at, updated_at`,
		land.ID, land.FarmerID, land.PlotName, land.Hamlet, land.ElevationM, land.Latitude, land.Longitude,
	).Scan(&land.CreatedAt, &land.UpdatedAt)
	return translateDatabaseError(err)
}

func (r *landRepository) Update(ctx context.Context, land *domain.Land) (*domain.Land, error) {
	row := r.db.QueryRowContext(ctx, `
		UPDATE lahan SET id_petani = $1, nama_petak = $2, dusun = $3,
			elevasi_mdpl = $4, latitude = $5, longitude = $6, updated_at = CURRENT_TIMESTAMP
		WHERE id_lahan = $7
		RETURNING `+landColumns,
		land.FarmerID, land.PlotName, land.Hamlet, land.ElevationM, land.Latitude, land.Longitude, land.ID,
	)
	updated, err := scanLand(row)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	*land = *updated
	return updated, nil
}

func (r *landRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM lahan WHERE id_lahan = $1`, id)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

func (r *landRepository) SetPolygon(ctx context.Context, id, geoJSON string) (*domain.Land, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer tx.Rollback()
	if _, err := tx.ExecContext(ctx, `SELECT pg_advisory_xact_lock(20261022, 1)`); err != nil {
		return nil, translateDatabaseError(err)
	}
	var lockedLandID string
	if err := tx.QueryRowContext(ctx, `SELECT id_lahan FROM lahan WHERE id_lahan = $1 FOR UPDATE`, id).Scan(&lockedLandID); err != nil {
		return nil, translateDatabaseError(err)
	}
	var valid bool
	err = tx.QueryRowContext(ctx, `
		SELECT GeometryType(candidate.geom) = 'POLYGON'
			AND ST_SRID(candidate.geom) = 4326
			AND ST_IsValid(candidate.geom)
		FROM (SELECT ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) AS geom) candidate`, geoJSON).Scan(&valid)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	if !valid {
		return nil, fmt.Errorf("%w: geometri harus berupa Polygon valid dengan SRID 4326", domain.ErrInvalid)
	}
	var overlappingID string
	err = tx.QueryRowContext(ctx, `
		SELECT id_lahan FROM lahan
		WHERE id_lahan <> $1 AND polygon_geom IS NOT NULL
		AND ST_Intersects(polygon_geom, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))
		ORDER BY id_lahan LIMIT 1`, id, geoJSON).Scan(&overlappingID)
	if err == nil {
		return nil, fmt.Errorf("%w: polygon bersinggungan dengan lahan %s", domain.ErrConflict, overlappingID)
	}
	if err != sql.ErrNoRows {
		return nil, translateDatabaseError(err)
	}
	land, err := scanLand(tx.QueryRowContext(ctx, `
		UPDATE lahan SET polygon_geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)
		WHERE id_lahan = $2
		RETURNING `+landColumns, geoJSON, id))
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	if err := tx.Commit(); err != nil {
		return nil, translateDatabaseError(err)
	}
	return land, nil
}

func (r *landRepository) DeletePolygon(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE lahan SET polygon_geom = NULL, luas_m2 = NULL WHERE id_lahan = $1`, id)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}

type rowScanner interface {
	Scan(...any) error
}

func scanLand(row rowScanner) (*domain.Land, error) {
	var land domain.Land
	var elevation sql.NullInt64
	var latitude, longitude, area sql.NullFloat64
	var polygon sql.NullString
	err := row.Scan(
		&land.ID, &land.FarmerID, &land.PlotName, &land.Hamlet,
		&elevation, &latitude, &longitude, &polygon, &area, &land.TreeCount,
		&land.CreatedAt, &land.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if elevation.Valid {
		value := int(elevation.Int64)
		land.ElevationM = &value
	}
	if latitude.Valid {
		value := latitude.Float64
		land.Latitude = &value
	}
	if longitude.Valid {
		value := longitude.Float64
		land.Longitude = &value
	}
	if area.Valid {
		value := area.Float64
		land.AreaM2 = &value
	}
	if polygon.Valid && strings.TrimSpace(polygon.String) != "" {
		land.Polygon = json.RawMessage(polygon.String)
	}
	return &land, nil
}
