package service

import (
	"context"
	"errors"
	"testing"

	"lembah-kopi/core-system/internal/domain"
)

type mockDashboardRepo struct {
	overview *domain.DashboardOverview
	err      error
}

func (m *mockDashboardRepo) GetOverview(_ context.Context) (*domain.DashboardOverview, error) {
	return m.overview, m.err
}

func TestDashboardService_GetOverview(t *testing.T) {
	expectedOverview := &domain.DashboardOverview{
		Summary: domain.DashboardSummary{
			FarmerCount:           15,
			LandAreaM2:            125000,
			CurrentMonthHarvestKG: 4500,
			ActiveBatchCount:      4,
		},
	}

	t.Run("success", func(t *testing.T) {
		repo := &mockDashboardRepo{overview: expectedOverview}
		svc := NewDashboardService(repo)

		res, err := svc.GetOverview(context.Background())
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if res.Summary.FarmerCount != 15 {
			t.Fatalf("farmer count = %d, want 15", res.Summary.FarmerCount)
		}
	})

	t.Run("error propagation", func(t *testing.T) {
		repoErr := errors.New("db error")
		repo := &mockDashboardRepo{err: repoErr}
		svc := NewDashboardService(repo)

		_, err := svc.GetOverview(context.Background())
		if !errors.Is(err, repoErr) {
			t.Fatalf("err = %v, want %v", err, repoErr)
		}
	})
}

