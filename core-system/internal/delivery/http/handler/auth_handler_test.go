package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"lembah-kopi/core-system/internal/delivery/http/middleware"
	"lembah-kopi/core-system/internal/domain"
)

type mockAuthUseCases struct {
	loginFn          func(ctx context.Context, request domain.LoginRequest) (*domain.LoginResponseData, error)
	getProfileFn     func(ctx context.Context, id string) (*domain.PenggunaAdmin, error)
	changePasswordFn func(ctx context.Context, id string, request domain.ChangePasswordRequest) error
	createAdminFn    func(ctx context.Context, request domain.CreateAdminRequest) (*domain.PenggunaAdmin, error)
}

func (m *mockAuthUseCases) Login(ctx context.Context, request domain.LoginRequest) (*domain.LoginResponseData, error) {
	if m.loginFn != nil {
		return m.loginFn(ctx, request)
	}
	return nil, errors.New("not implemented")
}

func (m *mockAuthUseCases) GetProfile(ctx context.Context, id string) (*domain.PenggunaAdmin, error) {
	if m.getProfileFn != nil {
		return m.getProfileFn(ctx, id)
	}
	return nil, errors.New("not implemented")
}

func (m *mockAuthUseCases) ChangePassword(ctx context.Context, id string, request domain.ChangePasswordRequest) error {
	if m.changePasswordFn != nil {
		return m.changePasswordFn(ctx, id, request)
	}
	return errors.New("not implemented")
}

func (m *mockAuthUseCases) CreateAdmin(ctx context.Context, request domain.CreateAdminRequest) (*domain.PenggunaAdmin, error) {
	if m.createAdminFn != nil {
		return m.createAdminFn(ctx, request)
	}
	return nil, errors.New("not implemented")
}

func TestAuthHandler_Login(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		h := NewAuthHandler(&mockAuthUseCases{
			loginFn: func(_ context.Context, _ domain.LoginRequest) (*domain.LoginResponseData, error) {
				return &domain.LoginResponseData{
					AccessToken: "token123",
					TokenType:   "Bearer",
					ExpiresAt:   time.Now().Add(time.Hour),
					User: domain.PenggunaAdmin{
						IDAdmin:  "ADM-001",
						Username: "admin",
					},
				}, nil
			},
		})

		body := bytes.NewBufferString(`{"username_or_email":"admin","password":"password123"}`)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", body)
		rec := httptest.NewRecorder()

		h.Login(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
		}
	})

	t.Run("invalid credentials returns 401", func(t *testing.T) {
		h := NewAuthHandler(&mockAuthUseCases{
			loginFn: func(_ context.Context, _ domain.LoginRequest) (*domain.LoginResponseData, error) {
				return nil, domain.ErrUnauthorized
			},
		})

		body := bytes.NewBufferString(`{"username_or_email":"admin","password":"wrongpassword"}`)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", body)
		rec := httptest.NewRecorder()

		h.Login(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnauthorized)
		}
	})

	t.Run("malformed json returns 400", func(t *testing.T) {
		h := NewAuthHandler(&mockAuthUseCases{})

		body := bytes.NewBufferString(`{invalid-json`)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", body)
		rec := httptest.NewRecorder()

		h.Login(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
		}
	})
}

func TestAuthHandler_GetProfile(t *testing.T) {
	t.Run("missing context userID returns 401", func(t *testing.T) {
		h := NewAuthHandler(&mockAuthUseCases{})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		rec := httptest.NewRecorder()

		h.GetProfile(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnauthorized)
		}
	})

	t.Run("success with context", func(t *testing.T) {
		h := NewAuthHandler(&mockAuthUseCases{
			getProfileFn: func(_ context.Context, id string) (*domain.PenggunaAdmin, error) {
				return &domain.PenggunaAdmin{IDAdmin: id, Username: "admin"}, nil
			},
		})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		ctx := context.WithValue(req.Context(), middleware.UserIDKey, "ADM-001")
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		h.GetProfile(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
		}
	})
}

func TestAuthHandler_CreateAdmin(t *testing.T) {
	t.Run("conflict returns 409", func(t *testing.T) {
		h := NewAuthHandler(&mockAuthUseCases{
			createAdminFn: func(_ context.Context, _ domain.CreateAdminRequest) (*domain.PenggunaAdmin, error) {
				return nil, domain.ErrConflict
			},
		})

		body, _ := json.Marshal(domain.CreateAdminRequest{
			Username: "existing",
		})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/admin", bytes.NewBuffer(body))
		rec := httptest.NewRecorder()

		h.CreateAdmin(rec, req)

		if rec.Code != http.StatusConflict {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusConflict)
		}
	})
}
