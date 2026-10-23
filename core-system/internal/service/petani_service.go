package service

import (
	"context"
	"fmt"
	"strings"
	"unicode/utf8"

	"lembah-kopi/core-system/internal/domain"
)

type FarmerService struct {
	repository domain.FarmerRepository
}

func NewFarmerService(repository domain.FarmerRepository) *FarmerService {
	return &FarmerService{repository: repository}
}

func (s *FarmerService) List(ctx context.Context, search string, page, pageSize int) (*domain.Page[domain.Farmer], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	items, total, err := s.repository.List(ctx, strings.TrimSpace(search), pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.Farmer]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *FarmerService) Get(ctx context.Context, id string) (*domain.Farmer, error) {
	return s.repository.Get(ctx, id)
}

func (s *FarmerService) Create(ctx context.Context, farmer *domain.Farmer) error {
	if err := validateFarmer(farmer); err != nil {
		return err
	}
	id, err := newIdentifier("PTN-")
	if err != nil {
		return err
	}
	farmer.ID = id
	return s.repository.Create(ctx, farmer)
}

func (s *FarmerService) Update(ctx context.Context, farmer *domain.Farmer) (*domain.Farmer, error) {
	if farmer.ID == "" {
		return nil, fmt.Errorf("%w: id_petani wajib diisi", domain.ErrInvalid)
	}
	if err := validateFarmer(farmer); err != nil {
		return nil, err
	}
	return s.repository.Update(ctx, farmer)
}

func (s *FarmerService) Delete(ctx context.Context, id string) error {
	return s.repository.Delete(ctx, id)
}

func validateFarmer(farmer *domain.Farmer) error {
	farmer.FullName = strings.TrimSpace(farmer.FullName)
	farmer.PhoneNumber = strings.TrimSpace(farmer.PhoneNumber)
	if farmer.FullName == "" || utf8.RuneCountInString(farmer.FullName) > 100 {
		return fmt.Errorf("%w: nama_lengkap wajib diisi dan maksimal 100 karakter", domain.ErrInvalid)
	}
	if farmer.PhoneNumber == "" || utf8.RuneCountInString(farmer.PhoneNumber) > 15 {
		return fmt.Errorf("%w: no_hp wajib diisi dan maksimal 15 karakter", domain.ErrInvalid)
	}
	return nil
}
