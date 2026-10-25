package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"lembah-kopi/core-system/internal/domain"
)

type auditRepository struct {
	db *sql.DB
}

func NewAuditRepository(db *sql.DB) domain.AuditRepository {
	return &auditRepository{db: db}
}

// fillActor melengkapi identitas pelaku dari tabel pengguna_admin (best effort).
func (r *auditRepository) fillActor(ctx context.Context, entry *domain.AuditLog) {
	var id, username, role string
	var err error
	if entry.AdminID != nil {
		err = r.db.QueryRowContext(ctx,
			`SELECT id_admin, username, role::text FROM pengguna_admin WHERE id_admin = $1`,
			*entry.AdminID).Scan(&id, &username, &role)
	} else {
		err = r.db.QueryRowContext(ctx,
			`SELECT id_admin, username, role::text FROM pengguna_admin WHERE username = $1 OR email = $1`,
			entry.Username).Scan(&id, &username, &role)
	}
	if err == nil {
		entry.AdminID, entry.Username, entry.Role = &id, username, &role
	}
}

func (r *auditRepository) Create(ctx context.Context, entry *domain.AuditLog) error {
	if entry.AdminID != nil || entry.Action == domain.AuditLoginSuccess {
		r.fillActor(ctx, entry)
	}
	if strings.TrimSpace(entry.Username) == "" {
		entry.Username = "(tidak diketahui)"
	}
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO log_audit (id_admin, username, peran, aksi, resource, resource_id,
			metode, path, status_code, request_id, ip_address)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id_audit, waktu`,
		entry.AdminID, entry.Username, entry.Role, entry.Action, entry.Resource, entry.ResourceID,
		entry.Method, entry.Path, entry.StatusCode, entry.RequestID, entry.IPAddress,
	).Scan(&entry.ID, &entry.Time)
	return translateDatabaseError(err)
}

func (r *auditRepository) List(ctx context.Context, filter domain.AuditFilter, limit, offset int) ([]domain.AuditLog, int, error) {
	where := []string{"TRUE"}
	args := make([]any, 0, 8)
	add := func(condition string, value any) {
		args = append(args, value)
		where = append(where, fmt.Sprintf(condition, len(args)))
	}
	if filter.Username != "" {
		add("username ILIKE $%[1]d", "%"+escapeLike(filter.Username)+"%")
	}
	if filter.Action != "" {
		add("aksi = $%[1]d", filter.Action)
	}
	if filter.Resource != "" {
		add("(resource = $%[1]d::text OR resource LIKE $%[1]d::text || '/%%')", filter.Resource)
	}
	if filter.Query != "" {
		add("(username ILIKE $%[1]d OR resource ILIKE $%[1]d OR resource_id ILIKE $%[1]d OR path ILIKE $%[1]d)",
			"%"+escapeLike(filter.Query)+"%")
	}
	if filter.From != nil {
		add("waktu >= $%[1]d", *filter.From)
	}
	if filter.To != nil {
		add("waktu < $%[1]d", *filter.To)
	}
	clause := strings.Join(where, " AND ")

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM log_audit WHERE `+clause, args...).Scan(&total); err != nil {
		return nil, 0, translateDatabaseError(err)
	}

	args = append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, fmt.Sprintf(`
		SELECT id_audit, waktu, id_admin, username, peran, aksi, resource, resource_id,
			metode, path, status_code, request_id, ip_address
		FROM log_audit WHERE %s
		ORDER BY waktu DESC, id_audit DESC LIMIT $%d OFFSET $%d`, clause, len(args)-1, len(args)), args...)
	if err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	defer rows.Close()

	items := make([]domain.AuditLog, 0)
	for rows.Next() {
		var item domain.AuditLog
		if err := rows.Scan(&item.ID, &item.Time, &item.AdminID, &item.Username, &item.Role, &item.Action,
			&item.Resource, &item.ResourceID, &item.Method, &item.Path, &item.StatusCode,
			&item.RequestID, &item.IPAddress); err != nil {
			return nil, 0, translateDatabaseError(err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, translateDatabaseError(err)
	}
	return items, total, nil
}

func escapeLike(value string) string {
	return strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`).Replace(value)
}

