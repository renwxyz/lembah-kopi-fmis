package service

import (
	"context"

	"lembah-kopi/core-system/internal/domain"
)

type AuditService struct {
	repository domain.AuditRepository
}

func NewAuditService(repository domain.AuditRepository) *AuditService {
	return &AuditService{repository: repository}
}

func (s *AuditService) Record(ctx context.Context, entry *domain.AuditLog) error {
	return s.repository.Create(ctx, entry)
}

func (s *AuditService) List(ctx context.Context, filter domain.AuditFilter, page, pageSize int) (*domain.Page[domain.AuditLog], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	items, total, err := s.repository.List(ctx, filter, pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.AuditLog]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

