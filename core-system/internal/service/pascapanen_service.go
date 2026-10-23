package service

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

type HarvestService struct {
	repository domain.HarvestRepository
}

func NewHarvestService(repository domain.HarvestRepository) *HarvestService {
	return &HarvestService{repository: repository}
}

func (s *HarvestService) ListByLand(ctx context.Context, landID string, filter domain.HarvestFilter, page, pageSize int) (*domain.Page[domain.HarvestLog], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	if filter.From != nil && filter.To != nil && filter.From.After(*filter.To) {
		return nil, fmt.Errorf("%w: tanggal_mulai tidak boleh setelah tanggal_selesai", domain.ErrInvalid)
	}
	if filter.Variety != "" && filter.Variety != string(domain.VarietyArabica) && filter.Variety != string(domain.VarietyRobusta) {
		return nil, fmt.Errorf("%w: varietas tidak dikenal", domain.ErrInvalid)
	}
	switch filter.Allocation {
	case "", string(domain.AllocationUnprocessed), string(domain.AllocationPartial), string(domain.AllocationFullyBatched):
	default:
		return nil, fmt.Errorf("%w: status_alokasi tidak dikenal", domain.ErrInvalid)
	}
	items, total, err := s.repository.ListByLand(ctx, strings.TrimSpace(landID), filter, pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.HarvestLog]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *HarvestService) Get(ctx context.Context, id string) (*domain.HarvestLog, error) {
	if strings.TrimSpace(id) == "" {
		return nil, fmt.Errorf("%w: id_panen wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Get(ctx, strings.TrimSpace(id))
}

func (s *HarvestService) Create(ctx context.Context, item *domain.HarvestLog) error {
	item.LandID = strings.TrimSpace(item.LandID)
	if item.LandID == "" || item.InventoryID == nil || strings.TrimSpace(*item.InventoryID) == "" {
		return fmt.Errorf("%w: id_lahan dan id_inventaris wajib diisi", domain.ErrInvalid)
	}
	*item.InventoryID = strings.TrimSpace(*item.InventoryID)
	if item.HarvestDate.IsZero() {
		return fmt.Errorf("%w: tanggal_panen wajib diisi", domain.ErrInvalid)
	}
	if err := validateHarvestFields(item); err != nil {
		return err
	}
	id, err := newIdentifier("PNN-")
	if err != nil {
		return err
	}
	item.ID = id
	return s.repository.Create(ctx, item)
}

func (s *HarvestService) Update(ctx context.Context, item *domain.HarvestLog) (*domain.HarvestLog, error) {
	item.ID = strings.TrimSpace(item.ID)
	if item.ID == "" || item.HarvestDate.IsZero() {
		return nil, fmt.Errorf("%w: id_panen dan tanggal_panen wajib diisi", domain.ErrInvalid)
	}
	if err := validateHarvestFields(item); err != nil {
		return nil, err
	}
	return s.repository.Update(ctx, item)
}

func (s *HarvestService) Delete(ctx context.Context, id string) error {
	if strings.TrimSpace(id) == "" {
		return fmt.Errorf("%w: id_panen wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Delete(ctx, strings.TrimSpace(id))
}

func validateHarvestFields(item *domain.HarvestLog) error {
	if item.CherryWeightKG <= 0 || item.CherryWeightKG > 999999.99 || !hasScale(item.CherryWeightKG, 2) {
		return fmt.Errorf("%w: berat_ceri_kg harus lebih dari 0 dengan maksimal 2 angka desimal", domain.ErrInvalid)
	}
	if item.PickingMethod != domain.PickingRedCherry && item.PickingMethod != domain.PickingMixed {
		return fmt.Errorf("%w: metode_petik tidak dikenal", domain.ErrInvalid)
	}
	return nil
}

type ProcessingMethodService struct {
	repository domain.ProcessingMethodRepository
}

func NewProcessingMethodService(repository domain.ProcessingMethodRepository) *ProcessingMethodService {
	return &ProcessingMethodService{repository: repository}
}

func (s *ProcessingMethodService) List(ctx context.Context, includeInactive bool) ([]domain.ProcessingMethod, error) {
	return s.repository.List(ctx, includeInactive)
}

func (s *ProcessingMethodService) Get(ctx context.Context, code string) (*domain.ProcessingMethod, error) {
	code = strings.ToUpper(strings.TrimSpace(code))
	if code == "" {
		return nil, fmt.Errorf("%w: kode_metode wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Get(ctx, code)
}

func (s *ProcessingMethodService) Create(ctx context.Context, item *domain.ProcessingMethod) error {
	if err := normalizeProcessingMethod(item); err != nil {
		return err
	}
	item.Active = true
	return s.repository.Create(ctx, item)
}

func (s *ProcessingMethodService) Update(ctx context.Context, item *domain.ProcessingMethod) (*domain.ProcessingMethod, error) {
	item.Code = strings.TrimSpace(item.Code)
	if item.Code == "" {
		return nil, fmt.Errorf("%w: kode_metode wajib diisi", domain.ErrInvalid)
	}
	if err := normalizeProcessingMethod(item); err != nil {
		return nil, err
	}
	return s.repository.Update(ctx, item)
}

func (s *ProcessingMethodService) Delete(ctx context.Context, code string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if code == "" {
		return fmt.Errorf("%w: kode_metode wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Delete(ctx, code)
}

var processingMethodCodePattern = regexp.MustCompile(`^[A-Z][A-Z0-9_]{0,29}$`)

func normalizeProcessingMethod(item *domain.ProcessingMethod) error {
	item.Code = strings.ToUpper(strings.TrimSpace(item.Code))
	item.Name = strings.TrimSpace(item.Name)
	if !processingMethodCodePattern.MatchString(item.Code) {
		return fmt.Errorf("%w: kode_metode harus berupa huruf kapital, angka, atau underscore dan diawali huruf", domain.ErrInvalid)
	}
	if item.Name == "" || len(item.Name) > 100 {
		return fmt.Errorf("%w: nama_metode wajib diisi dan maksimal 100 karakter", domain.ErrInvalid)
	}
	if item.Description != nil {
		description := strings.TrimSpace(*item.Description)
		if description == "" {
			item.Description = nil
		} else {
			item.Description = &description
		}
	}
	return nil
}

type ProcessingBatchService struct {
	repository domain.ProcessingBatchRepository
	methods    domain.ProcessingMethodRepository
}

func NewProcessingBatchService(repository domain.ProcessingBatchRepository, methods domain.ProcessingMethodRepository) *ProcessingBatchService {
	return &ProcessingBatchService{repository: repository, methods: methods}
}

func (s *ProcessingBatchService) List(ctx context.Context, filter domain.BatchFilter, page, pageSize int) (*domain.Page[domain.ProcessingBatch], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	if filter.Status != "" && !validProcessingStatus(domain.ProcessingStatus(filter.Status)) {
		return nil, fmt.Errorf("%w: status_proses tidak dikenal", domain.ErrInvalid)
	}
	filter.MethodCode = strings.ToUpper(strings.TrimSpace(filter.MethodCode))
	items, total, err := s.repository.List(ctx, filter, pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.ProcessingBatch]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *ProcessingBatchService) Get(ctx context.Context, id string) (*domain.ProcessingBatch, error) {
	if strings.TrimSpace(id) == "" {
		return nil, fmt.Errorf("%w: id_batch wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Get(ctx, strings.TrimSpace(id))
}

func (s *ProcessingBatchService) Create(ctx context.Context, item *domain.ProcessingBatch) error {
	item.MethodCode = strings.ToUpper(strings.TrimSpace(item.MethodCode))
	if item.MethodCode == "" || item.EstimatedStartDate.IsZero() {
		return fmt.Errorf("%w: metode_proses dan tanggal_mulai_olah wajib diisi", domain.ErrInvalid)
	}
	if _, err := s.activeMethod(ctx, item.MethodCode); err != nil {
		return err
	}
	if err := validateBatchTargets(item); err != nil {
		return err
	}
	id, err := newIdentifier("BAT-")
	if err != nil {
		return err
	}
	qrCode, err := newIdentifier("QR-")
	if err != nil {
		return err
	}
	item.ID, item.QRTraceCode, item.Status = id, qrCode, domain.ProcessingFermentation
	return s.repository.Create(ctx, item)
}

func (s *ProcessingBatchService) Update(ctx context.Context, item *domain.ProcessingBatch) (*domain.ProcessingBatch, error) {
	item.ID = strings.TrimSpace(item.ID)
	item.MethodCode = strings.ToUpper(strings.TrimSpace(item.MethodCode))
	if item.ID == "" || item.MethodCode == "" || item.EstimatedStartDate.IsZero() {
		return nil, fmt.Errorf("%w: id_batch, metode_proses, dan tanggal_mulai_olah wajib diisi", domain.ErrInvalid)
	}
	if _, err := s.activeMethod(ctx, item.MethodCode); err != nil {
		return nil, err
	}
	if err := validateBatchTargets(item); err != nil {
		return nil, err
	}
	if item.GreenBeanOutputKG != nil && (*item.GreenBeanOutputKG < 0 || *item.GreenBeanOutputKG > 999999.99 || !hasScale(*item.GreenBeanOutputKG, 2)) {
		return nil, fmt.Errorf("%w: berat_green_bean_kg harus 0 atau lebih dengan maksimal 2 angka desimal", domain.ErrInvalid)
	}
	return s.repository.Update(ctx, item)
}

func (s *ProcessingBatchService) Delete(ctx context.Context, id string) error {
	if strings.TrimSpace(id) == "" {
		return fmt.Errorf("%w: id_batch wajib diisi", domain.ErrInvalid)
	}
	return s.repository.Delete(ctx, strings.TrimSpace(id))
}

func (s *ProcessingBatchService) ListStages(ctx context.Context, batchID string, page, pageSize int) (*domain.Page[domain.ProcessingStageRecord], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	items, total, err := s.repository.ListStages(ctx, strings.TrimSpace(batchID), pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.ProcessingStageRecord]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *ProcessingBatchService) AddStage(ctx context.Context, item *domain.ProcessingStageRecord) error {
	item.BatchID = strings.TrimSpace(item.BatchID)
	if item.BatchID == "" || !validProcessingStatus(item.Status) {
		return fmt.Errorf("%w: id_batch dan status_proses yang valid wajib diisi", domain.ErrInvalid)
	}
	if item.ChangedAt.IsZero() {
		item.ChangedAt = time.Now().UTC()
	}
	if item.MoisturePercent != nil && (*item.MoisturePercent < 0 || *item.MoisturePercent > 100 || !hasScale(*item.MoisturePercent, 2)) {
		return fmt.Errorf("%w: kadar_air_persen harus 0-100 dengan maksimal 2 angka desimal", domain.ErrInvalid)
	}
	if item.Note != nil {
		note := strings.TrimSpace(*item.Note)
		if note == "" {
			item.Note = nil
		} else {
			item.Note = &note
		}
	}
	id, err := newIdentifier("STG-")
	if err != nil {
		return err
	}
	item.ID = id
	return s.repository.AddStage(ctx, item)
}

func (s *ProcessingBatchService) ListMappings(ctx context.Context, batchID string, page, pageSize int) (*domain.Page[domain.BatchPanenMapping], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	items, total, err := s.repository.ListMappings(ctx, strings.TrimSpace(batchID), pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.BatchPanenMapping]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *ProcessingBatchService) AddMapping(ctx context.Context, item *domain.BatchPanenMapping) error {
	item.BatchID, item.HarvestID = strings.TrimSpace(item.BatchID), strings.TrimSpace(item.HarvestID)
	if item.BatchID == "" || item.HarvestID == "" || item.UsedWeight <= 0 || item.UsedWeight > 999999.99 || !hasScale(item.UsedWeight, 2) {
		return fmt.Errorf("%w: batch, panen, dan berat_digunakan_kg positif (maksimal 2 desimal) wajib diisi", domain.ErrInvalid)
	}
	id, err := newIdentifier("MAP-")
	if err != nil {
		return err
	}
	item.ID = id
	return s.repository.AddMapping(ctx, item)
}

func (s *ProcessingBatchService) UpdateMapping(ctx context.Context, item *domain.BatchPanenMapping) error {
	item.ID, item.BatchID = strings.TrimSpace(item.ID), strings.TrimSpace(item.BatchID)
	if item.ID == "" || item.BatchID == "" || item.UsedWeight <= 0 || item.UsedWeight > 999999.99 || !hasScale(item.UsedWeight, 2) {
		return fmt.Errorf("%w: id mapping dan berat_digunakan_kg positif (maksimal 2 desimal) wajib diisi", domain.ErrInvalid)
	}
	return s.repository.UpdateMapping(ctx, item)
}

func (s *ProcessingBatchService) DeleteMapping(ctx context.Context, batchID, mappingID string) error {
	if strings.TrimSpace(batchID) == "" || strings.TrimSpace(mappingID) == "" {
		return fmt.Errorf("%w: id_batch dan id_mapping wajib diisi", domain.ErrInvalid)
	}
	return s.repository.DeleteMapping(ctx, strings.TrimSpace(batchID), strings.TrimSpace(mappingID))
}

func (s *ProcessingBatchService) GetTraceability(ctx context.Context, batchID string) (*domain.BatchTraceability, error) {
	if strings.TrimSpace(batchID) == "" {
		return nil, fmt.Errorf("%w: id_batch wajib diisi", domain.ErrInvalid)
	}
	return s.repository.GetTraceability(ctx, strings.TrimSpace(batchID))
}

func (s *ProcessingBatchService) activeMethod(ctx context.Context, code string) (*domain.ProcessingMethod, error) {
	method, err := s.methods.Get(ctx, code)
	if err != nil {
		return nil, err
	}
	if !method.Active {
		return nil, fmt.Errorf("%w: metode pascaproses tidak aktif", domain.ErrConflict)
	}
	return method, nil
}

func validateBatchTargets(item *domain.ProcessingBatch) error {
	if item.EstimatedCompletion != nil && item.EstimatedCompletion.Before(item.EstimatedStartDate) {
		return fmt.Errorf("%w: estimasi_tanggal_selesai tidak boleh sebelum tanggal_mulai_olah", domain.ErrInvalid)
	}
	if item.TargetMoisturePercent != nil &&
		(*item.TargetMoisturePercent < 0 || *item.TargetMoisturePercent > 100 || !hasScale(*item.TargetMoisturePercent, 2)) {
		return fmt.Errorf("%w: target_kadar_air_persen harus 0-100 dengan maksimal 2 angka desimal", domain.ErrInvalid)
	}
	return nil
}

func validProcessingStatus(status domain.ProcessingStatus) bool {
	switch status {
	case domain.ProcessingFermentation, domain.ProcessingDrying, domain.ProcessingHulling, domain.ProcessingComplete:
		return true
	default:
		return false
	}
}
