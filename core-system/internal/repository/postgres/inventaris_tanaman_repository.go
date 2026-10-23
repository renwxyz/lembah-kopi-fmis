package postgres

import (
	"context"
	"database/sql"
	"sort"

	"lembah-kopi/core-system/internal/domain"
)

type cropInventoryRepository struct {
	db *sql.DB
}

func NewCropInventoryRepository(db *sql.DB) domain.CropInventoryRepository {
	return &cropInventoryRepository{db: db}
}

func (r *cropInventoryRepository) ListByLand(ctx context.Context, landID string) ([]domain.CropInventory, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id_inventaris, id_lahan, varietas, jumlah_pohon, kelompok_usia, created_at, updated_at
		FROM inventaris_tanaman WHERE id_lahan = $1 ORDER BY id_inventaris`, landID)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.CropInventory, 0)
	for rows.Next() {
		var item domain.CropInventory
		if err := rows.Scan(&item.ID, &item.LandID, &item.Variety, &item.TreeCount, &item.AgeGroup, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, translateDatabaseError(err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, translateDatabaseError(err)
	}
	if len(items) == 0 {
		var existingLandID string
		if err := r.db.QueryRowContext(ctx, `SELECT id_lahan FROM lahan WHERE id_lahan = $1`, landID).Scan(&existingLandID); err != nil {
			return nil, translateDatabaseError(err)
		}
	}
	return items, nil
}

func (r *cropInventoryRepository) Get(ctx context.Context, id string) (*domain.CropInventory, error) {
	var item domain.CropInventory
	err := r.db.QueryRowContext(ctx, `
		SELECT id_inventaris, id_lahan, varietas, jumlah_pohon, kelompok_usia, created_at, updated_at
		FROM inventaris_tanaman WHERE id_inventaris = $1`, id).Scan(
		&item.ID, &item.LandID, &item.Variety, &item.TreeCount, &item.AgeGroup, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &item, nil
}

func (r *cropInventoryRepository) Create(ctx context.Context, item *domain.CropInventory) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return translateDatabaseError(err)
	}
	defer tx.Rollback()
	if err := lockLand(tx, ctx, item.LandID); err != nil {
		return err
	}
	err = tx.QueryRowContext(ctx, `
		INSERT INTO inventaris_tanaman (id_inventaris, id_lahan, varietas, jumlah_pohon, kelompok_usia)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at`,
		item.ID, item.LandID, item.Variety, item.TreeCount, item.AgeGroup,
	).Scan(&item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return translateDatabaseError(err)
	}
	if err := updateLandTreeCount(ctx, tx, item.LandID); err != nil {
		return err
	}
	return translateDatabaseError(tx.Commit())
}

func (r *cropInventoryRepository) Update(ctx context.Context, item *domain.CropInventory) (*domain.CropInventory, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer tx.Rollback()
	var previousLandID string
	err = tx.QueryRowContext(ctx, `SELECT id_lahan FROM inventaris_tanaman WHERE id_inventaris = $1`, item.ID).Scan(&previousLandID)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	if item.LandID == "" {
		item.LandID = previousLandID
	}
	if err := lockLands(tx, ctx, previousLandID, item.LandID); err != nil {
		return nil, err
	}
	var lockedLandID string
	err = tx.QueryRowContext(ctx, `SELECT id_lahan FROM inventaris_tanaman WHERE id_inventaris = $1 FOR UPDATE`, item.ID).Scan(&lockedLandID)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	if lockedLandID != previousLandID {
		return nil, domain.ErrConflict
	}
	var updated domain.CropInventory
	err = tx.QueryRowContext(ctx, `
		UPDATE inventaris_tanaman
		SET id_lahan = $1, varietas = $2, kelompok_usia = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id_inventaris = $4
		RETURNING id_inventaris, id_lahan, varietas, jumlah_pohon, kelompok_usia, created_at, updated_at`,
		item.LandID, item.Variety, item.AgeGroup, item.ID,
	).Scan(&updated.ID, &updated.LandID, &updated.Variety, &updated.TreeCount, &updated.AgeGroup, &updated.CreatedAt, &updated.UpdatedAt)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	if err := updateLandTreeCount(ctx, tx, previousLandID); err != nil {
		return nil, err
	}
	if item.LandID != previousLandID {
		if err := updateLandTreeCount(ctx, tx, item.LandID); err != nil {
			return nil, err
		}
	}
	if err := tx.Commit(); err != nil {
		return nil, translateDatabaseError(err)
	}
	*item = updated
	return &updated, nil
}

func (r *cropInventoryRepository) Delete(ctx context.Context, id string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return translateDatabaseError(err)
	}
	defer tx.Rollback()
	var landID string
	err = tx.QueryRowContext(ctx, `SELECT id_lahan FROM inventaris_tanaman WHERE id_inventaris = $1`, id).Scan(&landID)
	if err != nil {
		return translateDatabaseError(err)
	}
	if err := lockLand(tx, ctx, landID); err != nil {
		return err
	}
	var lockedLandID string
	err = tx.QueryRowContext(ctx, `SELECT id_lahan FROM inventaris_tanaman WHERE id_inventaris = $1 FOR UPDATE`, id).Scan(&lockedLandID)
	if err != nil {
		return translateDatabaseError(err)
	}
	if lockedLandID != landID {
		return domain.ErrConflict
	}
	result, err := tx.ExecContext(ctx, `DELETE FROM inventaris_tanaman WHERE id_inventaris = $1`, id)
	if err != nil {
		return translateDatabaseError(err)
	}
	if err := ensureOneRow(result); err != nil {
		return err
	}
	if err := updateLandTreeCount(ctx, tx, landID); err != nil {
		return err
	}
	return translateDatabaseError(tx.Commit())
}

func lockLand(tx *sql.Tx, ctx context.Context, id string) error {
	var lockedID string
	err := tx.QueryRowContext(ctx, `SELECT id_lahan FROM lahan WHERE id_lahan = $1 FOR UPDATE`, id).Scan(&lockedID)
	return translateDatabaseError(err)
}

func lockLands(tx *sql.Tx, ctx context.Context, ids ...string) error {
	unique := make(map[string]struct{}, len(ids))
	ordered := make([]string, 0, len(ids))
	for _, id := range ids {
		if _, exists := unique[id]; !exists {
			unique[id] = struct{}{}
			ordered = append(ordered, id)
		}
	}
	sort.Strings(ordered)
	for _, id := range ordered {
		if err := lockLand(tx, ctx, id); err != nil {
			return err
		}
	}
	return nil
}

func updateLandTreeCount(ctx context.Context, tx *sql.Tx, landID string) error {
	result, err := tx.ExecContext(ctx, `
		UPDATE lahan SET total_pohon = (
			SELECT COALESCE(SUM(jumlah_pohon), 0)
			FROM inventaris_tanaman WHERE id_lahan = $1
		) WHERE id_lahan = $1`, landID)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}
