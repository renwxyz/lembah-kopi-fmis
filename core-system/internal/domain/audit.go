package domain

import (
	"context"
	"time"
)

const (
	AuditCreate         = "CREATE"
	AuditUpdate         = "UPDATE"
	AuditDelete         = "DELETE"
	AuditChangePassword = "CHANGE_PASSWORD"
	AuditLoginSuccess   = "LOGIN_SUCCESS"
	AuditLoginFailed    = "LOGIN_FAILED"
)

// AuditLog mencatat siapa melakukan apa pada resource apa.
type AuditLog struct {
	ID         int64     `json:"id_audit"`
	Time       time.Time `json:"waktu"`
	AdminID    *string   `json:"id_admin"`
	Username   string    `json:"username"`
	Role       *string   `json:"peran"`
	Action     string    `json:"aksi"`
	Resource   string    `json:"resource"`
	ResourceID *string   `json:"resource_id"`
	Method     string    `json:"metode"`
	Path       string    `json:"path"`
	StatusCode int       `json:"status_code"`
	RequestID  *string   `json:"request_id"`
	IPAddress  *string   `json:"ip_address"`
}

type AuditFilter struct {
	Username string
	Action   string
	Resource string
	Query    string
	From     *time.Time
	// To bersifat eksklusif.
	To *time.Time
}

type AuditRepository interface {
	Create(context.Context, *AuditLog) error
	List(context.Context, AuditFilter, int, int) ([]AuditLog, int, error)
}

