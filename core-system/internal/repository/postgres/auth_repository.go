package postgres

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

type authRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) domain.AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) GetByUsernameOrEmail(ctx context.Context, identifier string) (*domain.PenggunaAdmin, error) {
	query := `
		SELECT id_admin, username, email, password_hash, nama_lengkap, role, status_aktif, last_login_at, created_at, updated_at
		FROM pengguna_admin
		WHERE username = $1 OR email = $1
		LIMIT 1`

	var admin domain.PenggunaAdmin
	err := r.db.QueryRowContext(ctx, query, identifier).Scan(
		&admin.IDAdmin,
		&admin.Username,
		&admin.Email,
		&admin.PasswordHash,
		&admin.NamaLengkap,
		&admin.Role,
		&admin.StatusAktif,
		&admin.LastLoginAt,
		&admin.CreatedAt,
		&admin.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}

	return &admin, nil
}

func (r *authRepository) GetByID(ctx context.Context, idAdmin string) (*domain.PenggunaAdmin, error) {
	query := `
		SELECT id_admin, username, email, password_hash, nama_lengkap, role, status_aktif, last_login_at, created_at, updated_at
		FROM pengguna_admin
		WHERE id_admin = $1
		LIMIT 1`

	var admin domain.PenggunaAdmin
	err := r.db.QueryRowContext(ctx, query, idAdmin).Scan(
		&admin.IDAdmin,
		&admin.Username,
		&admin.Email,
		&admin.PasswordHash,
		&admin.NamaLengkap,
		&admin.Role,
		&admin.StatusAktif,
		&admin.LastLoginAt,
		&admin.CreatedAt,
		&admin.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}

	return &admin, nil
}

func (r *authRepository) UpdateLastLogin(ctx context.Context, idAdmin string, loginTime time.Time) error {
	query := `
		UPDATE pengguna_admin
		SET last_login_at = $1
		WHERE id_admin = $2`

	_, err := r.db.ExecContext(ctx, query, loginTime, idAdmin)
	return err
}

func (r *authRepository) UpdatePassword(ctx context.Context, idAdmin string, passwordHash string) error {
	query := `
		UPDATE pengguna_admin
		SET password_hash = $1
		WHERE id_admin = $2`

	_, err := r.db.ExecContext(ctx, query, passwordHash, idAdmin)
	return err
}

func (r *authRepository) Create(ctx context.Context, admin *domain.PenggunaAdmin) error {
	query := `
		INSERT INTO pengguna_admin (id_admin, username, email, password_hash, nama_lengkap, role, status_aktif)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at, updated_at`

	return r.db.QueryRowContext(
		ctx,
		query,
		admin.IDAdmin,
		admin.Username,
		admin.Email,
		admin.PasswordHash,
		admin.NamaLengkap,
		admin.Role,
		admin.StatusAktif,
	).Scan(&admin.CreatedAt, &admin.UpdatedAt)
}
