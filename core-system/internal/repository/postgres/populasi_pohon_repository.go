package postgres

import (
	"context"
	"database/sql"

	"lembah-kopi/core-system/internal/domain"
)

type treePopulationRepository struct {
	db *sql.DB
}

func NewTreePopulationRepository(db *sql.DB) domain.TreePopulationRepository {
	return &treePopulationRepository{db: db}
}

func (r *treePopulationRepository) GetByLand(ctx context.Context, landID string) (*domain.TreePopulationSummary, error) {
	summary := &domain.TreePopulationSummary{LandID: landID, Items: make([]domain.TreePopulationItem, 0)}
	err := r.db.QueryRowContext(ctx, `
		SELECT total_pohon FROM lahan WHERE id_lahan = $1`, landID,
	).Scan(&summary.TotalTreeCount)
	if err != nil {
		return nil, translateDatabaseError(err)
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT id_inventaris, varietas, kelompok_usia, jumlah_pohon
		FROM inventaris_tanaman
		WHERE id_lahan = $1
		ORDER BY id_inventaris`, landID)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer rows.Close()
	for rows.Next() {
		var item domain.TreePopulationItem
		if err := rows.Scan(&item.InventoryID, &item.Variety, &item.AgeGroup, &item.TreeCount); err != nil {
			return nil, translateDatabaseError(err)
		}
		summary.Items = append(summary.Items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, translateDatabaseError(err)
	}
	return summary, nil
}

func (r *treePopulationRepository) SetForInventory(ctx context.Context, inventoryID string, treeCount int) (*domain.TreePopulationItem, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer tx.Rollback()

	var landID string
	if err := tx.QueryRowContext(ctx, `
		SELECT id_lahan FROM inventaris_tanaman WHERE id_inventaris = $1`, inventoryID,
	).Scan(&landID); err != nil {
		return nil, translateDatabaseError(err)
	}
	if err := lockLand(tx, ctx, landID); err != nil {
		return nil, err
	}

	var lockedLandID string
	if err := tx.QueryRowContext(ctx, `
		SELECT id_lahan FROM inventaris_tanaman
		WHERE id_inventaris = $1 FOR UPDATE`, inventoryID,
	).Scan(&lockedLandID); err != nil {
		return nil, translateDatabaseError(err)
	}
	if lockedLandID != landID {
		return nil, domain.ErrConflict
	}

	var item domain.TreePopulationItem
	err = tx.QueryRowContext(ctx, `
		UPDATE inventaris_tanaman
		SET jumlah_pohon = $1
		WHERE id_inventaris = $2
		RETURNING id_inventaris, varietas, kelompok_usia, jumlah_pohon`,
		treeCount, inventoryID,
	).Scan(&item.InventoryID, &item.Variety, &item.AgeGroup, &item.TreeCount)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	if err := updateLandTreeCount(ctx, tx, landID); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, translateDatabaseError(err)
	}
	return &item, nil
}
