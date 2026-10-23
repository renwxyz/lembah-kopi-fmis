package postgres

import (
	"database/sql"
	"errors"
	"fmt"

	"lembah-kopi/core-system/internal/domain"

	"github.com/jackc/pgx/v5/pgconn"
)

func translateDatabaseError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, sql.ErrNoRows) {
		return domain.ErrNotFound
	}
	var postgresError *pgconn.PgError
	if errors.As(err, &postgresError) {
		switch postgresError.Code {
		case "23503":
			return fmt.Errorf("%w: referensi data masih digunakan atau tidak valid", domain.ErrConflict)
		case "23505":
			return fmt.Errorf("%w: data dengan ID tersebut sudah ada", domain.ErrConflict)
		case "23514", "22P02", "22023":
			return fmt.Errorf("%w: nilai tidak memenuhi aturan database", domain.ErrInvalid)
		}
	}
	return fmt.Errorf("database operation: %w", err)
}

func ensureOneRow(result sql.Result) error {
	affected, err := result.RowsAffected()
	if err != nil {
		return translateDatabaseError(err)
	}
	if affected == 0 {
		return domain.ErrNotFound
	}
	return nil
}
