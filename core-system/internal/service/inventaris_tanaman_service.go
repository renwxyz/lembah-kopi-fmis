package service

import (
	"context"
	"fmt"

	"lembah-kopi/core-system/internal/domain"
)

type CropInventoryService struct {
	repository domain.CropInventoryRepository
}

func NewCropInventoryService(repository domain.CropInventoryRepository) *CropInventoryService {
	return &CropInventoryService{repository: repository}
}

func (s *CropInventoryService) ListByLand(ctx context.Context, landID string) ([]domain.CropInventory, error) {
	return s.repository.ListByLand(ctx, landID)
}

func (s *CropInventoryService) Get(ctx context.Context, id string) (*domain.CropInventory, error) {
	return s.repository.Get(ctx, id)
}

func (s *CropInventoryService) Create(ctx context.Context, inventory *domain.CropInventory) error {
	if err := validateCropInventory(inventory); err != nil {
		return err
	}
	id, err := newIdentifier("INV-")
	if err != nil {
		return err
	}
	inventory.ID = id
	inventory.TreeCount = 0
	return s.repository.Create(ctx, inventory)
}

func (s *CropInventoryService) Update(ctx context.Context, inventory *domain.CropInventory) (*domain.CropInventory, error) {
	if inventory.ID == "" {
		return nil, fmt.Errorf("%w: id_inventaris wajib diisi", domain.ErrInvalid)
	}
	if inventory.LandID == "" {
		existing, err := s.repository.Get(ctx, inventory.ID)
		if err != nil {
			return nil, err
		}
		inventory.LandID = existing.LandID
	}
	if err := validateCropInventory(inventory); err != nil {
		return nil, err
	}
	return s.repository.Update(ctx, inventory)
}

func (s *CropInventoryService) Delete(ctx context.Context, id string) error {
	return s.repository.Delete(ctx, id)
}

func validateCropInventory(inventory *domain.CropInventory) error {
	if inventory.LandID == "" {
		return fmt.Errorf("%w: id_lahan wajib diisi", domain.ErrInvalid)
	}
	if inventory.Variety != domain.VarietyRobusta && inventory.Variety != domain.VarietyArabica {
		return fmt.Errorf("%w: varietas harus ROBUSTA atau ARABIKA", domain.ErrInvalid)
	}
	switch inventory.AgeGroup {
	case domain.AgeUnderFiveYears, domain.AgeUnderFifteenYears, domain.AgeAtLeastFifteenYears:
		return nil
	default:
		return fmt.Errorf("%w: kelompok_usia tidak dikenali", domain.ErrInvalid)
	}
}
