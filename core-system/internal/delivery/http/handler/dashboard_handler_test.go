package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"lembah-kopi/core-system/internal/domain"
)

type mockDashboardUC struct {
	overview *domain.DashboardOverview
	err      error
}

func (m *mockDashboardUC) GetOverview(_ context.Context) (*domain.DashboardOverview, error) {
	return m.overview, m.err
}

func TestDashboardHandler_GetOverview(t *testing.T) {
	t.Run("success response format", func(t *testing.T) {
		h := NewDashboardHandler(&mockDashboardUC{
			overview: &domain.DashboardOverview{
				Summary: domain.DashboardSummary{FarmerCount: 5},
			},
		})

		req := httptest.NewRequest(http.MethodGet, "/dashboard/overview", nil)
		rec := httptest.NewRecorder()

		h.GetOverview(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
		}

		var res struct {
			Success bool                     `json:"success"`
			Message string                   `json:"message"`
			Data    domain.DashboardOverview `json:"data"`
		}
		if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
			t.Fatalf("unmarshal json: %v", err)
		}
		if !res.Success {
			t.Fatal("success = false, want true")
		}
		if res.Data.Summary.FarmerCount != 5 {
			t.Fatalf("FarmerCount = %d, want 5", res.Data.Summary.FarmerCount)
		}
	})

	t.Run("internal server error format", func(t *testing.T) {
		h := NewDashboardHandler(&mockDashboardUC{
			err: errors.New("database connection lost"),
		})

		req := httptest.NewRequest(http.MethodGet, "/dashboard/overview", nil)
		rec := httptest.NewRecorder()

		h.GetOverview(rec, req)

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusInternalServerError)
		}
		if got := rec.Header().Get("Content-Type"); got != "application/problem+json" {
			t.Fatalf("Content-Type = %q, want application/problem+json", got)
		}
	})
}

