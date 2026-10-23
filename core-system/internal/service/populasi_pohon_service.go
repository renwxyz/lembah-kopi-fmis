package service

import (
	"context"
	"fmt"

	"lembah-kopi/core-system/internal/domain"
)

type TreePopulationService struct {
	repository domain.TreePopulationRepository
}

func NewTreePopulationService(repository domain.TreePopulationRepository) *TreePopulationService {
	return &TreePopulationService{repository: repository}
}

func (s *TreePopulationService) GetByLand(ctx context.Context, landID string) (*domain.TreePopulationSummary, error) {
	if landID == "" {
		return nil, fmt.Errorf("%w: id_lahan wajib diisi", domain.ErrInvalid)
	}
	return s.repository.GetByLand(ctx, landID)
}

func (s *TreePopulationService) SetForInventory(ctx context.Context, inventoryID string, treeCount int) (*domain.TreePopulationItem, error) {
	if inventoryID == "" || treeCount < 0 {
		return nil, fmt.Errorf("%w: id_inventaris wajib diisi dan jumlah_pohon tidak boleh negatif", domain.ErrInvalid)
	}
	return s.repository.SetForInventory(ctx, inventoryID, treeCount)
}
