package service

import (
	"context"

	"lembah-kopi/core-system/internal/domain"
)

type DashboardService struct {
	repository domain.DashboardRepository
}

func NewDashboardService(repository domain.DashboardRepository) *DashboardService {
	return &DashboardService{repository: repository}
}

func (s *DashboardService) GetOverview(ctx context.Context) (*domain.DashboardOverview, error) {
	return s.repository.GetOverview(ctx)
}
