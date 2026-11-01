package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

type mockPinger struct {
	err error
}

func (m *mockPinger) PingContext(ctx context.Context) error {
	return m.err
}

func TestHealthHandler_Liveness(t *testing.T) {
	h := NewHealthHandler(nil)
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()

	h.Liveness(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}

	var res HealthResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if res.Status != "UP" {
		t.Fatalf("res.Status = %s, want UP", res.Status)
	}
}

func TestHealthHandler_Readiness(t *testing.T) {
	t.Run("database UP", func(t *testing.T) {
		h := NewHealthHandler(&mockPinger{err: nil})
		req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
		rec := httptest.NewRecorder()

		h.Readiness(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
		}

		var res HealthResponse
		if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if res.Status != "UP" || res.Checks["database"] != "UP" {
			t.Fatalf("unexpected res: %+v", res)
		}
	})

	t.Run("database DOWN", func(t *testing.T) {
		h := NewHealthHandler(&mockPinger{err: errors.New("connection refused")})
		req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
		rec := httptest.NewRecorder()

		h.Readiness(rec, req)

		if rec.Code != http.StatusServiceUnavailable {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusServiceUnavailable)
		}

		var res HealthResponse
		if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
		if res.Status != "DOWN" {
			t.Fatalf("res.Status = %s, want DOWN", res.Status)
		}
	})
}

