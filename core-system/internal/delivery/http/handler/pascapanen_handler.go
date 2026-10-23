package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/delivery/http/middleware"
	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
)

type HarvestUseCases interface {
	ListByLand(context.Context, string, domain.HarvestFilter, int, int) (*domain.Page[domain.HarvestLog], error)
	Get(context.Context, string) (*domain.HarvestLog, error)
	Create(context.Context, *domain.HarvestLog) error
	Update(context.Context, *domain.HarvestLog) (*domain.HarvestLog, error)
	Delete(context.Context, string) error
}

type HarvestHandler struct{ useCases HarvestUseCases }

type HarvestCreateRequest struct {
	InventoryID    string               `json:"id_inventaris"`
	HarvestDate    string               `json:"tanggal_panen"`
	CherryWeightKG float64              `json:"berat_ceri_kg"`
	PickingMethod  domain.PickingMethod `json:"metode_petik"`
}

type HarvestUpdateRequest struct {
	HarvestDate    string               `json:"tanggal_panen"`
	CherryWeightKG float64              `json:"berat_ceri_kg"`
	PickingMethod  domain.PickingMethod `json:"metode_petik"`
}

func NewHarvestHandler(useCases HarvestUseCases) *HarvestHandler {
	return &HarvestHandler{useCases: useCases}
}

func (h *HarvestHandler) ListByLand(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	from, err := parseDateQuery(r, "dari")
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	to, err := parseDateQuery(r, "sampai")
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	filter := domain.HarvestFilter{
		From: from, To: to,
		Variety:    strings.TrimSpace(r.URL.Query().Get("varietas")),
		Allocation: strings.TrimSpace(r.URL.Query().Get("status_alokasi")),
	}
	result, err := h.useCases.ListByLand(r.Context(), chi.URLParam(r, "id"), filter, page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Daftar panen berhasil diambil", result)
}

func (h *HarvestHandler) Get(w http.ResponseWriter, r *http.Request) {
	item, err := h.useCases.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data panen berhasil diambil", item)
}

func (h *HarvestHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request HarvestCreateRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	date, err := time.Parse("2006-01-02", strings.TrimSpace(request.HarvestDate))
	if err != nil {
		writeModuleError(w, r, domain.ErrInvalid)
		return
	}
	item := &domain.HarvestLog{
		LandID: chi.URLParam(r, "id"), InventoryID: &request.InventoryID,
		HarvestDate: date, CherryWeightKG: request.CherryWeightKG, PickingMethod: request.PickingMethod,
	}
	if err := h.useCases.Create(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Panen berhasil dicatat", item)
}

func (h *HarvestHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request HarvestUpdateRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	date, err := time.Parse("2006-01-02", strings.TrimSpace(request.HarvestDate))
	if err != nil {
		writeModuleError(w, r, domain.ErrInvalid)
		return
	}
	item := &domain.HarvestLog{
		ID: chi.URLParam(r, "id"), HarvestDate: date,
		CherryWeightKG: request.CherryWeightKG, PickingMethod: request.PickingMethod,
	}
	updated, err := h.useCases.Update(r.Context(), item)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data panen berhasil diperbarui", updated)
}

func (h *HarvestHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

type ProcessingMethodUseCases interface {
	List(context.Context, bool) ([]domain.ProcessingMethod, error)
	Get(context.Context, string) (*domain.ProcessingMethod, error)
	Create(context.Context, *domain.ProcessingMethod) error
	Update(context.Context, *domain.ProcessingMethod) (*domain.ProcessingMethod, error)
	Delete(context.Context, string) error
}

type ProcessingMethodHandler struct{ useCases ProcessingMethodUseCases }

type ProcessingMethodRequest struct {
	Code        string  `json:"kode_metode,omitempty"`
	Name        string  `json:"nama_metode"`
	Description *string `json:"deskripsi"`
	Active      *bool   `json:"aktif,omitempty"`
}

type ProcessingMethodUpdateRequest struct {
	Name        string                   `json:"nama_metode"`
	Description OptionalNullable[string] `json:"deskripsi"`
	Active      *bool                    `json:"aktif,omitempty"`
}

func NewProcessingMethodHandler(useCases ProcessingMethodUseCases) *ProcessingMethodHandler {
	return &ProcessingMethodHandler{useCases: useCases}
}

func (h *ProcessingMethodHandler) List(w http.ResponseWriter, r *http.Request) {
	includeInactive := false
	if value := r.URL.Query().Get("semua"); value != "" {
		if value != "true" && value != "false" {
			writeModuleError(w, r, domain.ErrInvalid)
			return
		}
		includeInactive = value == "true"
	}
	items, err := h.useCases.List(r.Context(), includeInactive)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Katalog metode pascaproses berhasil diambil", items)
}

func (h *ProcessingMethodHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request ProcessingMethodRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	item := &domain.ProcessingMethod{Code: request.Code, Name: request.Name, Description: request.Description}
	if err := h.useCases.Create(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Metode pascaproses berhasil ditambahkan", item)
}

func (h *ProcessingMethodHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request ProcessingMethodUpdateRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	existing, err := h.useCases.Get(r.Context(), chi.URLParam(r, "kode"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	active := existing.Active
	if request.Active != nil {
		active = *request.Active
	}
	description := existing.Description
	if request.Description.Set {
		description = request.Description.Value
	}
	item := &domain.ProcessingMethod{
		Code: chi.URLParam(r, "kode"), Name: request.Name,
		Description: description, Active: active,
	}
	updated, err := h.useCases.Update(r.Context(), item)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Metode pascaproses berhasil diperbarui", updated)
}

func (h *ProcessingMethodHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.Delete(r.Context(), chi.URLParam(r, "kode")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

type ProcessingBatchUseCases interface {
	List(context.Context, domain.BatchFilter, int, int) (*domain.Page[domain.ProcessingBatch], error)
	Get(context.Context, string) (*domain.ProcessingBatch, error)
	Create(context.Context, *domain.ProcessingBatch) error
	Update(context.Context, *domain.ProcessingBatch) (*domain.ProcessingBatch, error)
	Delete(context.Context, string) error
	ListStages(context.Context, string, int, int) (*domain.Page[domain.ProcessingStageRecord], error)
	AddStage(context.Context, *domain.ProcessingStageRecord) error
	ListMappings(context.Context, string, int, int) (*domain.Page[domain.BatchPanenMapping], error)
	AddMapping(context.Context, *domain.BatchPanenMapping) error
	UpdateMapping(context.Context, *domain.BatchPanenMapping) error
	DeleteMapping(context.Context, string, string) error
	GetTraceability(context.Context, string) (*domain.BatchTraceability, error)
}

type ProcessingBatchHandler struct{ useCases ProcessingBatchUseCases }

type ProcessingBatchCreateRequest struct {
	MethodCode          string   `json:"metode_proses"`
	StartDate           string   `json:"tanggal_mulai_olah"`
	EstimatedCompletion *string  `json:"estimasi_tanggal_selesai"`
	TargetMoisture      *float64 `json:"target_kadar_air_persen"`
}

type OptionalNullable[T any] struct {
	Value *T
	Set   bool
}

func (value *OptionalNullable[T]) UnmarshalJSON(data []byte) error {
	value.Set = true
	if bytes.Equal(bytes.TrimSpace(data), []byte("null")) {
		value.Value = nil
		return nil
	}
	var decoded T
	if err := json.Unmarshal(data, &decoded); err != nil {
		return err
	}
	value.Value = &decoded
	return nil
}

type ProcessingBatchUpdateRequest struct {
	MethodCode          string                    `json:"metode_proses"`
	StartDate           string                    `json:"tanggal_mulai_olah"`
	EstimatedCompletion OptionalNullable[string]  `json:"estimasi_tanggal_selesai"`
	TargetMoisture      OptionalNullable[float64] `json:"target_kadar_air_persen"`
	GreenBeanOutput     OptionalNullable[float64] `json:"berat_green_bean_kg"`
}

type ProcessingStageRequest struct {
	Status          domain.ProcessingStatus `json:"status_proses"`
	ChangedAt       string                  `json:"tanggal_perubahan,omitempty"`
	MoisturePercent *float64                `json:"kadar_air_persen"`
	Note            *string                 `json:"catatan"`
}

type BatchHarvestRequest struct {
	HarvestID  string  `json:"id_panen"`
	UsedWeight float64 `json:"berat_digunakan_kg"`
}

func NewProcessingBatchHandler(useCases ProcessingBatchUseCases) *ProcessingBatchHandler {
	return &ProcessingBatchHandler{useCases: useCases}
}

func (h *ProcessingBatchHandler) List(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	filter := domain.BatchFilter{
		Status:     strings.TrimSpace(r.URL.Query().Get("status_proses")),
		MethodCode: strings.TrimSpace(r.URL.Query().Get("metode_proses")),
	}
	result, err := h.useCases.List(r.Context(), filter, page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Daftar batch pascaproses berhasil diambil", result)
}

func (h *ProcessingBatchHandler) Get(w http.ResponseWriter, r *http.Request) {
	item, err := h.useCases.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data batch berhasil diambil", item)
}

func (h *ProcessingBatchHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request ProcessingBatchCreateRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	item, err := processingBatchFromRequest(request)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	if err := h.useCases.Create(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Batch pascaproses berhasil dibuat", item)
}

func (h *ProcessingBatchHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request ProcessingBatchUpdateRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	if !request.EstimatedCompletion.Set || !request.TargetMoisture.Set || !request.GreenBeanOutput.Set {
		writeModuleError(w, r, domain.ErrInvalid)
		return
	}
	startDate, err := time.Parse("2006-01-02", strings.TrimSpace(request.StartDate))
	if err != nil {
		writeModuleError(w, r, domain.ErrInvalid)
		return
	}
	var estimatedCompletion *time.Time
	if request.EstimatedCompletion.Value != nil {
		parsed, err := time.Parse("2006-01-02", strings.TrimSpace(*request.EstimatedCompletion.Value))
		if err != nil {
			writeModuleError(w, r, domain.ErrInvalid)
			return
		}
		estimatedCompletion = &parsed
	}
	item := &domain.ProcessingBatch{
		ID: chi.URLParam(r, "id"), MethodCode: strings.TrimSpace(request.MethodCode),
		EstimatedStartDate: startDate, EstimatedCompletion: estimatedCompletion,
		TargetMoisturePercent: request.TargetMoisture.Value, GreenBeanOutputKG: request.GreenBeanOutput.Value,
	}
	updated, err := h.useCases.Update(r.Context(), item)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Batch pascaproses berhasil diperbarui", updated)
}

func processingBatchFromRequest(request ProcessingBatchCreateRequest) (*domain.ProcessingBatch, error) {
	startDate, err := time.Parse("2006-01-02", strings.TrimSpace(request.StartDate))
	if err != nil {
		return nil, domain.ErrInvalid
	}
	item := &domain.ProcessingBatch{
		MethodCode: strings.TrimSpace(request.MethodCode), EstimatedStartDate: startDate,
		TargetMoisturePercent: request.TargetMoisture,
	}
	if request.EstimatedCompletion != nil && strings.TrimSpace(*request.EstimatedCompletion) != "" {
		date, err := time.Parse("2006-01-02", strings.TrimSpace(*request.EstimatedCompletion))
		if err != nil {
			return nil, domain.ErrInvalid
		}
		item.EstimatedCompletion = &date
	}
	return item, nil
}

func (h *ProcessingBatchHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

func (h *ProcessingBatchHandler) ListStages(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	result, err := h.useCases.ListStages(r.Context(), chi.URLParam(r, "id"), page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Histori tahap batch berhasil diambil", result)
}

func (h *ProcessingBatchHandler) AddStage(w http.ResponseWriter, r *http.Request) {
	var request ProcessingStageRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	var changedAt time.Time
	if value := strings.TrimSpace(request.ChangedAt); value != "" {
		parsed, err := time.Parse(time.RFC3339, value)
		if err != nil {
			writeModuleError(w, r, domain.ErrInvalid)
			return
		}
		changedAt = parsed
	}
	item := &domain.ProcessingStageRecord{
		BatchID: chi.URLParam(r, "id"), Status: request.Status, ChangedAt: changedAt,
		MoisturePercent: request.MoisturePercent, Note: request.Note,
	}
	if adminID, ok := r.Context().Value(middleware.UserIDKey).(string); ok && adminID != "" {
		item.AdminID = &adminID
	}
	if err := h.useCases.AddStage(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Tahap batch berhasil dicatat", item)
}

func (h *ProcessingBatchHandler) ListMappings(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	result, err := h.useCases.ListMappings(r.Context(), chi.URLParam(r, "id"), page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Alokasi panen batch berhasil diambil", result)
}

func (h *ProcessingBatchHandler) AddMapping(w http.ResponseWriter, r *http.Request) {
	var request BatchHarvestRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	item := &domain.BatchPanenMapping{
		BatchID: chi.URLParam(r, "id"), HarvestID: request.HarvestID, UsedWeight: request.UsedWeight,
	}
	if err := h.useCases.AddMapping(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Alokasi panen ke batch berhasil dicatat", item)
}

func (h *ProcessingBatchHandler) UpdateMapping(w http.ResponseWriter, r *http.Request) {
	var request BatchHarvestRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	item := &domain.BatchPanenMapping{
		ID: chi.URLParam(r, "mapping_id"), BatchID: chi.URLParam(r, "id"),
		UsedWeight: request.UsedWeight,
	}
	if err := h.useCases.UpdateMapping(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Alokasi panen berhasil diperbarui", item)
}

func (h *ProcessingBatchHandler) DeleteMapping(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.DeleteMapping(r.Context(), chi.URLParam(r, "id"), chi.URLParam(r, "mapping_id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

func (h *ProcessingBatchHandler) GetTraceability(w http.ResponseWriter, r *http.Request) {
	result, err := h.useCases.GetTraceability(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Traceability batch berhasil diambil", result)
}
