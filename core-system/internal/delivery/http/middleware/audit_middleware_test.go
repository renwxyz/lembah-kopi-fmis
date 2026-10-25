package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

type captureRecorder struct {
	entries chan *domain.AuditLog
}

func newCaptureRecorder() *captureRecorder {
	return &captureRecorder{entries: make(chan *domain.AuditLog, 4)}
}

func (c *captureRecorder) Record(_ context.Context, entry *domain.AuditLog) error {
	c.entries <- entry
	return nil
}

func (c *captureRecorder) next(t *testing.T) *domain.AuditLog {
	t.Helper()
	select {
	case entry := <-c.entries:
		return entry
	case <-time.After(time.Second):
		t.Fatal("no audit entry recorded")
		return nil
	}
}

func (c *captureRecorder) assertNone(t *testing.T) {
	t.Helper()
	select {
	case entry := <-c.entries:
		t.Fatalf("unexpected audit entry: %#v", entry)
	case <-time.After(50 * time.Millisecond):
	}
}

func statusHandler(status int) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(status) })
}

func TestClassifyPath(t *testing.T) {
	tests := []struct {
		path, action, wantResource, wantID, wantAction string
	}{
		{"/api/v1/petani/", domain.AuditCreate, "petani", "", domain.AuditCreate},
		{"/api/v1/lahan/LHN-1", domain.AuditUpdate, "lahan", "LHN-1", domain.AuditUpdate},
		{"/api/v1/lahan/LHN-1/inventaris", domain.AuditCreate, "lahan/inventaris", "LHN-1", domain.AuditCreate},
		{"/api/v1/auth/password", domain.AuditUpdate, "auth", "", domain.AuditChangePassword},
	}
	for _, tt := range tests {
		resource, id, action := classifyPath(tt.path, tt.action)
		gotID := ""
		if id != nil {
			gotID = *id
		}
		if resource != tt.wantResource || gotID != tt.wantID || action != tt.wantAction {
			t.Errorf("classifyPath(%q) = (%q, %q, %q), want (%q, %q, %q)",
				tt.path, resource, gotID, action, tt.wantResource, tt.wantID, tt.wantAction)
		}
	}
}

func TestAuditMutationsRecordsSuccessfulMutationWithActor(t *testing.T) {
	recorder := newCaptureRecorder()
	handler := AuditMutations(recorder)(statusHandler(http.StatusOK))

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/lahan/LHN-1", nil)
	ctx := context.WithValue(req.Context(), UserIDKey, "ADM-1")
	ctx = context.WithValue(ctx, UserRoleKey, domain.RoleSuperAdmin)
	handler.ServeHTTP(httptest.NewRecorder(), req.WithContext(ctx))

	entry := recorder.next(t)
	if entry.Action != domain.AuditDelete || entry.Resource != "lahan" || entry.ResourceID == nil || *entry.ResourceID != "LHN-1" {
		t.Fatalf("unexpected entry: %#v", entry)
	}
	if entry.AdminID == nil || *entry.AdminID != "ADM-1" || entry.Role == nil || *entry.Role != "SUPER_ADMIN" {
		t.Fatalf("actor not captured: %#v", entry)
	}
}

func TestAuditMutationsSkipsReadsAndFailures(t *testing.T) {
	recorder := newCaptureRecorder()

	AuditMutations(recorder)(statusHandler(http.StatusOK)).
		ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/api/v1/lahan", nil))
	AuditMutations(recorder)(statusHandler(http.StatusBadRequest)).
		ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/api/v1/lahan", nil))

	recorder.assertNone(t)
}

func TestAuditLoginRecordsFailureWithoutPassword(t *testing.T) {
	recorder := newCaptureRecorder()
	handler := AuditLogin(recorder)(statusHandler(http.StatusUnauthorized))

	body := `{"username_or_email":"admin_glodogan","password":"rahasia"}`
	handler.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", strings.NewReader(body)))

	entry := recorder.next(t)
	if entry.Action != domain.AuditLoginFailed || entry.Username != "admin_glodogan" || entry.StatusCode != http.StatusUnauthorized {
		t.Fatalf("unexpected entry: %#v", entry)
	}
	if strings.Contains(entry.Path, "rahasia") {
		t.Fatal("password leaked into audit entry")
	}
}

func TestAuditLoginRecordsSuccess(t *testing.T) {
	recorder := newCaptureRecorder()
	handler := AuditLogin(recorder)(statusHandler(http.StatusOK))

	handler.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/api/v1/auth/login",
		strings.NewReader(`{"username_or_email":"superadmin","password":"x"}`)))

	if entry := recorder.next(t); entry.Action != domain.AuditLoginSuccess || entry.Username != "superadmin" {
		t.Fatalf("unexpected entry: %#v", entry)
	}
}

