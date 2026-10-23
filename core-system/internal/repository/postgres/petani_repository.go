package postgres

import (
	"context"
	"database/sql"

	"lembah-kopi/core-system/internal/domain"
)

type farmerRepository struct {
	db *sql.DB
}

func NewFarmerRepository(db *sql.DB) domain.FarmerRepository {
	return &farmerRepository{db: db}
}

func (r *farmerRepository) List(ctx context.Context, search string, limit, offset int) ([]domain.Farmer, int, error) {
	pattern := "%" + search + "%"
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM petani WHERE nama_lengkap ILIKE $1 OR no_hp ILIKE $1`, pattern).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	rows, err := r.db.QueryContext(ctx, `
		SELECT id_petani, nama_lengkap, no_hp, created_at, updated_at
		FROM petani
		WHERE nama_lengkap ILIKE $1 OR no_hp ILIKE $1
		ORDER BY nama_lengkap, id_petani
		LIMIT $2 OFFSET $3`, pattern, limit, offset)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()
	items := make([]domain.Farmer, 0)
	for rows.Next() {
		var farmer domain.Farmer
		if err := rows.Scan(&farmer.ID, &farmer.FullName, &farmer.PhoneNumber, &farmer.CreatedAt, &farmer.UpdatedAt); err != nil {
			return nil, 0, translateDatabaseError(err)
		}
		items = append(items, farmer)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	return items, total, nil
}

func (r *farmerRepository) Get(ctx context.Context, id string) (*domain.Farmer, error) {
	var farmer domain.Farmer
	err := r.db.QueryRowContext(ctx, `
		SELECT id_petani, nama_lengkap, no_hp, created_at, updated_at
		FROM petani WHERE id_petani = $1`, id).Scan(
		&farmer.ID, &farmer.FullName, &farmer.PhoneNumber, &farmer.CreatedAt, &farmer.UpdatedAt,
	)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	return &farmer, nil
}

func (r *farmerRepository) Create(ctx context.Context, farmer *domain.Farmer) error {
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO petani (id_petani, nama_lengkap, no_hp)
		VALUES ($1, $2, $3)
		RETURNING created_at, updated_at`,
		farmer.ID, farmer.FullName, farmer.PhoneNumber,
	).Scan(&farmer.CreatedAt, &farmer.UpdatedAt)
	return translateDatabaseError(err)
}

func (r *farmerRepository) Update(ctx context.Context, farmer *domain.Farmer) (*domain.Farmer, error) {
	var updated domain.Farmer
	err := r.db.QueryRowContext(ctx, `
		UPDATE petani
		SET nama_lengkap = $1, no_hp = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id_petani = $3
		RETURNING id_petani, nama_lengkap, no_hp, created_at, updated_at`,
		farmer.FullName, farmer.PhoneNumber, farmer.ID,
	).Scan(&updated.ID, &updated.FullName, &updated.PhoneNumber, &updated.CreatedAt, &updated.UpdatedAt)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	*farmer = updated
	return &updated, nil
}

func (r *farmerRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM petani WHERE id_petani = $1`, id)
	if err != nil {
		return translateDatabaseError(err)
	}
	return ensureOneRow(result)
}
