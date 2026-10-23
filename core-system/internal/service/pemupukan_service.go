package service

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

type FertilizationService struct {
	repository domain.FertilizationRepository
}

func NewFertilizationService(repository domain.FertilizationRepository) *FertilizationService {
	return &FertilizationService{repository: repository}
}

func (s *FertilizationService) ListByLand(ctx context.Context, landID string, page, pageSize int) (*domain.Page[domain.Fertilization], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	items, total, err := s.repository.ListByLand(ctx, landID, pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.Fertilization]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *FertilizationService) Get(ctx context.Context, id string) (*domain.Fertilization, error) {
	if strings.TrimSpace(id) == "" {
		return nil, fmt.Errorf("%w: id_pemupukan wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Get(ctx, id)
}

func (s *FertilizationService) Create(ctx context.Context, item *domain.Fertilization) error {
	if err := validateFertilization(item); err != nil {
		return err
	}
	id, err := newIdentifier("PUP-")
	if err != nil {
		return err
	}
	item.ID = id
	return s.repository.Create(ctx, item)
}

func (s *FertilizationService) Update(ctx context.Context, item *domain.Fertilization) (*domain.Fertilization, error) {
	if strings.TrimSpace(item.ID) == "" {
		return nil, fmt.Errorf("%w: id_pemupukan wajib diisi", domain.ErrInvalid)
	}
	if strings.TrimSpace(item.LandID) == "" {
		existing, err := s.repository.Get(ctx, item.ID)
		if err != nil {
			return nil, err
		}
		item.LandID = existing.LandID
	}
	if err := validateFertilization(item); err != nil {
		return nil, err
	}
	return s.repository.Update(ctx, item)
}

func (s *FertilizationService) Delete(ctx context.Context, id string) error {
	if strings.TrimSpace(id) == "" {
		return fmt.Errorf("%w: id_pemupukan wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Delete(ctx, id)
}

func validateFertilization(item *domain.Fertilization) error {
	if strings.TrimSpace(item.LandID) == "" || strings.TrimSpace(item.Fertilizer) == "" {
		return fmt.Errorf("%w: id_lahan dan jenis_pupuk wajib diisi", domain.ErrInvalid)
	}
	if len([]rune(item.Fertilizer)) > 100 {
		return fmt.Errorf("%w: jenis_pupuk maksimal 100 karakter", domain.ErrInvalid)
	}
	item.Fertilizer = strings.TrimSpace(item.Fertilizer)
	if item.AppliedAt.IsZero() {
		return fmt.Errorf("%w: tanggal_aplikasi wajib diisi", domain.ErrInvalid)
	}
	if item.AppliedAt.After(time.Now()) {
		return fmt.Errorf("%w: tanggal_aplikasi harus merupakan aplikasi yang sudah terlaksana", domain.ErrInvalid)
	}
	if item.DoseKG < 0 || item.DoseKG > 999999.99 || !hasScale(item.DoseKG, 2) || math.IsNaN(item.DoseKG) || math.IsInf(item.DoseKG, 0) {
		return fmt.Errorf("%w: dosis_kg harus 0-999999.99 dengan maksimal 2 angka desimal", domain.ErrInvalid)
	}
	return nil
}
