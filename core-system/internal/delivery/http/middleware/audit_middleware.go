package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net"
	"net/http"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/domain"

	chiMiddleware "github.com/go-chi/chi/v5/middleware"
)

const (
	apiPrefix       = "/api/v1/"
	loginBodyLimit  = 1 << 16
	maxAuditField   = 100
	auditWriteLimit = 5 * time.Second
)

// AuditRecorder menyimpan satu entri audit trail.
type AuditRecorder interface {
	Record(ctx context.Context, entry *domain.AuditLog) error
}

// AuditMutations mencatat request mutasi (POST/PUT/PATCH/DELETE) yang berhasil.
// Harus dipasang setelah AuthMiddleware agar identitas pelaku tersedia.
// Body request tidak pernah dicatat.
func AuditMutations(recorder AuditRecorder) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			action := mutationAction(r.Method)
			if action == "" {
				next.ServeHTTP(w, r)
				return
			}
			wrapped := chiMiddleware.NewWrapResponseWriter(w, r.ProtoMajor)
			next.ServeHTTP(wrapped, r)

			status := responseStatus(wrapped.Status())
			if status < 200 || status >= 300 {
				return
			}
			resource, resourceID, action := classifyPath(r.URL.Path, action)
			entry := newAuditEntry(r, action, resource, resourceID, status)
			if id, ok := r.Context().Value(UserIDKey).(string); ok && id != "" {
				entry.AdminID = &id
			}
			if role, ok := r.Context().Value(UserRoleKey).(domain.AdminRole); ok && role != "" {
				value := string(role)
				entry.Role = &value
			}
			recordAudit(recorder, entry)
		})
	}
}

// AuditLogin mencatat LOGIN_SUCCESS dan LOGIN_FAILED. Password tidak pernah dicatat.
func AuditLogin(recorder AuditRecorder) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, _ := io.ReadAll(io.LimitReader(r.Body, loginBodyLimit+1))
			r.Body = io.NopCloser(io.MultiReader(bytes.NewReader(body), r.Body))

			var payload struct {
				UsernameOrEmail string `json:"username_or_email"`
			}
			if len(body) <= loginBodyLimit {
				_ = json.Unmarshal(body, &payload)
			}

			wrapped := chiMiddleware.NewWrapResponseWriter(w, r.ProtoMajor)
			next.ServeHTTP(wrapped, r)

			status := responseStatus(wrapped.Status())
			var action string
			switch {
			case status >= 200 && status < 300:
				action = domain.AuditLoginSuccess
			case status >= 400 && status < 500:
				action = domain.AuditLoginFailed
			default:
				return
			}
			entry := newAuditEntry(r, action, "auth", nil, status)
			entry.Username = truncate(strings.TrimSpace(payload.UsernameOrEmail))
			if entry.Username == "" {
				entry.Username = "(kosong)"
			}
			recordAudit(recorder, entry)
		})
	}
}

func recordAudit(recorder AuditRecorder, entry *domain.AuditLog) {
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), auditWriteLimit)
		defer cancel()
		if err := recorder.Record(ctx, entry); err != nil {
			slog.Error("failed to record audit log", "error", err, "action", entry.Action, "path", entry.Path)
		}
	}()
}

func responseStatus(status int) int {
	if status == 0 {
		return http.StatusOK
	}
	return status
}

func mutationAction(method string) string {
	switch method {
	case http.MethodPost:
		return domain.AuditCreate
	case http.MethodPut, http.MethodPatch:
		return domain.AuditUpdate
	case http.MethodDelete:
		return domain.AuditDelete
	default:
		return ""
	}
}

// classifyPath menurunkan resource dan id dari path, mis.
// /api/v1/lahan/LHN-1/inventaris -> ("lahan/inventaris", "LHN-1").
func classifyPath(path, action string) (string, *string, string) {
	trimmed := strings.Trim(strings.TrimPrefix(path, strings.TrimSuffix(apiPrefix, "/")), "/")
	segments := strings.Split(trimmed, "/")
	if len(segments) == 0 || segments[0] == "" {
		return "unknown", nil, action
	}
	if segments[0] == "auth" && len(segments) > 1 && segments[1] == "password" {
		return "auth", nil, domain.AuditChangePassword
	}
	resource := segments[0]
	var resourceID *string
	if len(segments) > 1 && segments[1] != "" {
		id := truncate(segments[1])
		resourceID = &id
	}
	if len(segments) > 2 {
		resource += "/" + segments[2]
	}
	return truncate(resource), resourceID, action
}

func newAuditEntry(r *http.Request, action, resource string, resourceID *string, status int) *domain.AuditLog {
	entry := &domain.AuditLog{
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Method:     r.Method,
		Path:       truncateTo(r.URL.Path, 300),
		StatusCode: status,
	}
	if requestID := chiMiddleware.GetReqID(r.Context()); requestID != "" {
		entry.RequestID = &requestID
	}
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil && host != "" {
		entry.IPAddress = &host
	}
	return entry
}

func truncate(value string) string {
	return truncateTo(value, maxAuditField)
}

func truncateTo(value string, limit int) string {
	runes := []rune(value)
	if len(runes) <= limit {
		return value
	}
	return string(runes[:limit])
}
