package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

type PestDiseaseService struct {
	repository domain.PestDiseaseRepository
}

func NewPestDiseaseService(repository domain.PestDiseaseRepository) *PestDiseaseService {
	return &PestDiseaseService{repository: repository}
}

func (s *PestDiseaseService) ListByLand(ctx context.Context, landID string, filter domain.IncidentFilter, page, pageSize int) (*domain.Page[domain.PestDiseaseIncident], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	if err := validateIncidentFilter(filter); err != nil {
		return nil, err
	}
	items, total, err := s.repository.ListByLand(ctx, landID, filter, pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.PestDiseaseIncident]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *PestDiseaseService) Get(ctx context.Context, id string) (*domain.PestDiseaseIncident, error) {
	if strings.TrimSpace(id) == "" {
		return nil, fmt.Errorf("%w: id_insiden wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Get(ctx, id)
}

func (s *PestDiseaseService) Create(ctx context.Context, item *domain.PestDiseaseIncident) error {
	if strings.TrimSpace(item.LandID) == "" || strings.TrimSpace(item.PestDisease) == "" {
		return fmt.Errorf("%w: id_lahan dan jenis_hama_penyakit wajib diisi", domain.ErrInvalid)
	}
	if len([]rune(item.PestDisease)) > 100 {
		return fmt.Errorf("%w: jenis_hama_penyakit maksimal 100 karakter", domain.ErrInvalid)
	}
	item.PestDisease = strings.TrimSpace(item.PestDisease)
	if item.FoundAt.IsZero() {
		return fmt.Errorf("%w: tanggal_ditemukan wajib diisi", domain.ErrInvalid)
	}
	if err := validateSeverity(item.Severity); err != nil {
		return err
	}
	id, err := newIdentifier("HMA-")
	if err != nil {
		return err
	}
	item.ID = id
	item.CurrentStatus = domain.StatusTerdeteksi
	return s.repository.Create(ctx, item)
}

func (s *PestDiseaseService) Update(ctx context.Context, item *domain.PestDiseaseIncident) (*domain.PestDiseaseIncident, error) {
	if strings.TrimSpace(item.ID) == "" {
		return nil, fmt.Errorf("%w: id_insiden wajib diisi", domain.ErrInvalid)
	}
	if strings.TrimSpace(item.LandID) == "" {
		existing, err := s.repository.Get(ctx, item.ID)
		if err != nil {
			return nil, err
		}
		item.LandID = existing.LandID
	}
	if strings.TrimSpace(item.PestDisease) == "" || len([]rune(item.PestDisease)) > 100 {
		return nil, fmt.Errorf("%w: jenis_hama_penyakit wajib diisi dan maksimal 100 karakter", domain.ErrInvalid)
	}
	item.PestDisease = strings.TrimSpace(item.PestDisease)
	if item.FoundAt.IsZero() {
		return nil, fmt.Errorf("%w: tanggal_ditemukan wajib diisi", domain.ErrInvalid)
	}
	if err := validateSeverity(item.Severity); err != nil {
		return nil, err
	}
	return s.repository.Update(ctx, item)
}

func (s *PestDiseaseService) Delete(ctx context.Context, id string) error {
	if strings.TrimSpace(id) == "" {
		return fmt.Errorf("%w: id_insiden wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Delete(ctx, id)
}

func (s *PestDiseaseService) ListTreatments(ctx context.Context, incidentID string, page, pageSize int) (*domain.Page[domain.TreatmentRecord], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	items, total, err := s.repository.ListTreatments(ctx, incidentID, pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.TreatmentRecord]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *PestDiseaseService) AddTreatment(ctx context.Context, item *domain.TreatmentRecord) error {
	if strings.TrimSpace(item.IncidentID) == "" {
		return fmt.Errorf("%w: id_insiden wajib diisi", domain.ErrInvalid)
	}
	if item.TreatedAt.IsZero() {
		item.TreatedAt = time.Now()
	}
	if item.TreatedAt.After(time.Now()) {
		return fmt.Errorf("%w: tanggal_penanganan tidak boleh di masa depan", domain.ErrInvalid)
	}
	if item.Action != nil {
		action := strings.TrimSpace(*item.Action)
		if action == "" {
			item.Action = nil
		} else {
			item.Action = &action
		}
	}
	if err := validateTreatmentStatus(item.Status); err != nil {
		return err
	}
	id, err := newIdentifier("HST-")
	if err != nil {
		return err
	}
	item.ID = id
	return s.repository.AddTreatment(ctx, item)
}

func validateIncidentFilter(filter domain.IncidentFilter) error {
	if filter.Status != "" && !isTreatmentStatus(domain.StatusPenanganan(filter.Status)) {
		return fmt.Errorf("%w: status_penanganan tidak dikenal", domain.ErrInvalid)
	}
	if filter.Severity != "" && !isSeverity(domain.TingkatSerangan(filter.Severity)) {
		return fmt.Errorf("%w: tingkat_serangan tidak dikenal", domain.ErrInvalid)
	}
	if filter.From != nil && filter.To != nil && filter.From.After(*filter.To) {
		return fmt.Errorf("%w: tanggal_mulai tidak boleh setelah tanggal_selesai", domain.ErrInvalid)
	}
	return nil
}

func validateSeverity(value domain.TingkatSerangan) error {
	if !isSeverity(value) {
		return fmt.Errorf("%w: tingkat_serangan harus RINGAN, SEDANG, atau BERAT", domain.ErrInvalid)
	}
	return nil
}

func validateTreatmentStatus(value domain.StatusPenanganan) error {
	if !isTreatmentStatus(value) {
		return fmt.Errorf("%w: status_penanganan tidak dikenal", domain.ErrInvalid)
	}
	return nil
}

func isSeverity(value domain.TingkatSerangan) bool {
	return value == domain.TingkatRingan || value == domain.TingkatSedang || value == domain.TingkatBerat
}

func isTreatmentStatus(value domain.StatusPenanganan) bool {
	return value == domain.StatusTerdeteksi || value == domain.StatusDalamPenanganan || value == domain.StatusTerkendali
}
