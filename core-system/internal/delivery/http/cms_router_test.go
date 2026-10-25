package http

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"lembah-kopi/core-system/internal/delivery/http/handler"
	"lembah-kopi/core-system/internal/domain"

	"github.com/golang-jwt/jwt/v5"
)

// fakeCMS menanam interface agar method yang tidak diuji akan panic bila terpanggil.
type fakeCMS struct{ handler.CMSUseCases }

func (fakeCMS) PublicHome(context.Context) (*domain.PublicHome, error) {
	return &domain.PublicHome{}, nil
}

func (fakeCMS) GetSettings(context.Context) (*domain.SiteSettings, error) {
	return &domain.SiteSettings{AboutValues: []domain.CommunityValue{}}, nil
}

func (fakeCMS) DeleteProduct(context.Context, string) error { return nil }

func cmsTestRouter() http.Handler {
	return NewRouter(
		(*handler.AuthHandler)(nil),
		nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil,
		"test-secret", nil,
		WithCMS(handler.NewCMSHandler(fakeCMS{})),
	)
}

func bearer(t *testing.T, role domain.AdminRole) string {
	t.Helper()
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "ADM-1", "role": string(role), "exp": time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte("test-secret"))
	if err != nil {
		t.Fatal(err)
	}
	return "Bearer " + token
}

func TestCMSRouteAccessControl(t *testing.T) {
	tests := []struct {
		name, method, path, auth string
		want                     int
	}{
		{"public home needs no token", http.MethodGet, "/api/v1/public/home", "", http.StatusOK},
		{"cms needs token", http.MethodGet, "/api/v1/cms/pengaturan", "", http.StatusUnauthorized},
		{"admin can read cms", http.MethodGet, "/api/v1/cms/pengaturan", bearer(t, domain.RoleAdminKelompokTani), http.StatusOK},
		{"super admin can read cms", http.MethodGet, "/api/v1/cms/pengaturan", bearer(t, domain.RoleSuperAdmin), http.StatusOK},
		{"unknown role is rejected", http.MethodGet, "/api/v1/cms/pengaturan", bearer(t, "GUEST"), http.StatusForbidden},
		{"admin cannot delete", http.MethodDelete, "/api/v1/cms/produk/KPI-1", bearer(t, domain.RoleAdminKelompokTani), http.StatusForbidden},
		{"super admin can delete", http.MethodDelete, "/api/v1/cms/produk/KPI-1", bearer(t, domain.RoleSuperAdmin), http.StatusNoContent},
	}
	router := cmsTestRouter()
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request := httptest.NewRequest(tt.method, tt.path, nil)
			if tt.auth != "" {
				request.Header.Set("Authorization", tt.auth)
			}
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)
			if response.Code != tt.want {
				t.Fatalf("status = %d, want %d (body: %s)", response.Code, tt.want, response.Body.String())
			}
		})
	}
}

func TestPublicHomeIsCacheable(t *testing.T) {
	response := httptest.NewRecorder()
	cmsTestRouter().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/v1/public/home", nil))
	if got := response.Header().Get("Cache-Control"); got == "" {
		t.Fatal("expected Cache-Control header on public home")
	}
}

