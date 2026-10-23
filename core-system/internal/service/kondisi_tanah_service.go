package service

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

type SoilConditionService struct {
	repository domain.SoilConditionRepository
}

func NewSoilConditionService(repository domain.SoilConditionRepository) *SoilConditionService {
	return &SoilConditionService{repository: repository}
}

func (s *SoilConditionService) ListByLand(ctx context.Context, landID string, filter domain.SoilConditionFilter, page, pageSize int) (*domain.Page[domain.SoilConditionLog], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	if err := validateSoilFilter(filter); err != nil {
		return nil, err
	}
	items, total, err := s.repository.ListByLand(ctx, landID, filter, pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.SoilConditionLog]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *SoilConditionService) Get(ctx context.Context, id string) (*domain.SoilConditionLog, error) {
	if strings.TrimSpace(id) == "" {
		return nil, fmt.Errorf("%w: id_log_tanah wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Get(ctx, id)
}

func (s *SoilConditionService) Create(ctx context.Context, item *domain.SoilConditionLog) error {
	if item.LandID == "" {
		return fmt.Errorf("%w: id_lahan wajib diisi", domain.ErrInvalid)
	}
	if item.MeasuredAt.IsZero() {
		item.MeasuredAt = time.Now()
	}
	if err := validateSoilMeasurement(item); err != nil {
		return err
	}
	id, err := newIdentifier("LOG-")
	if err != nil {
		return err
	}
	item.ID = id
	return s.repository.Create(ctx, item)
}

func validateSoilFilter(filter domain.SoilConditionFilter) error {
	if filter.MonitoringStep != "" && filter.MonitoringStep != string(domain.TahapSebelum) && filter.MonitoringStep != string(domain.TahapSesudah) {
		return fmt.Errorf("%w: tahap_pemantauan tidak dikenal", domain.ErrInvalid)
	}
	if filter.MonitoringStep != "" && filter.FertilizerID == "" {
		return fmt.Errorf("%w: id_pemupukan wajib digunakan bersama tahap_pemantauan", domain.ErrInvalid)
	}
	if filter.From != nil && filter.To != nil && filter.From.After(*filter.To) {
		return fmt.Errorf("%w: waktu_mulai tidak boleh setelah waktu_selesai", domain.ErrInvalid)
	}
	return nil
}

func validateSoilMeasurement(item *domain.SoilConditionLog) error {
	if item.FertilizerID != nil {
		fertilizerID := strings.TrimSpace(*item.FertilizerID)
		if fertilizerID == "" {
			return fmt.Errorf("%w: id_pemupukan tidak boleh kosong", domain.ErrInvalid)
		}
		item.FertilizerID = &fertilizerID
	}
	if item.FertilizerID == nil && item.MonitoringStep != nil ||
		item.FertilizerID != nil && item.MonitoringStep == nil {
		return fmt.Errorf("%w: id_pemupukan dan tahap_pemantauan harus diisi bersama", domain.ErrInvalid)
	}
	if item.MonitoringStep != nil && *item.MonitoringStep != domain.TahapSebelum && *item.MonitoringStep != domain.TahapSesudah {
		return fmt.Errorf("%w: tahap_pemantauan harus SEBELUM atau SESUDAH", domain.ErrInvalid)
	}
	if item.SoilPH != nil && (*item.SoilPH < 0 || *item.SoilPH > 14 || !hasScale(*item.SoilPH, 1)) {
		return fmt.Errorf("%w: ph_tanah harus 0-14 dengan maksimal 1 angka desimal", domain.ErrInvalid)
	}
	if item.Moisture != nil && (*item.Moisture < 0 || *item.Moisture > 100 || !hasScale(*item.Moisture, 2)) {
		return fmt.Errorf("%w: kelembapan harus 0-100 dengan maksimal 2 angka desimal", domain.ErrInvalid)
	}
	if item.TemperatureC != nil && (*item.TemperatureC < -999.9 || *item.TemperatureC > 999.9 || !hasScale(*item.TemperatureC, 1)) {
		return fmt.Errorf("%w: suhu_celsius harus dapat disimpan dengan presisi 1 angka desimal", domain.ErrInvalid)
	}
	for field, value := range map[string]*int{
		"n_value": item.Nitrogen, "p_value": item.Phosphorus,
		"k_value": item.Potassium, "ec_value": item.Conductivity,
	} {
		if value != nil && *value < 0 {
			return fmt.Errorf("%w: %s tidak boleh negatif", domain.ErrInvalid, field)
		}
	}
	return nil
}

func hasScale(value float64, scale int) bool {
	factor := math.Pow10(scale)
	return math.Abs(value*factor-math.Round(value*factor)) < 1e-8
}
