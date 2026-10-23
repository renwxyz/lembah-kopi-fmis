package handler

import (
	"context"
	"net/http"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/delivery/http/middleware"
	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
)

type PestDiseaseUseCases interface {
	ListByLand(context.Context, string, domain.IncidentFilter, int, int) (*domain.Page[domain.PestDiseaseIncident], error)
	Get(context.Context, string) (*domain.PestDiseaseIncident, error)
	Create(context.Context, *domain.PestDiseaseIncident) error
	Update(context.Context, *domain.PestDiseaseIncident) (*domain.PestDiseaseIncident, error)
	Delete(context.Context, string) error
	ListTreatments(context.Context, string, int, int) (*domain.Page[domain.TreatmentRecord], error)
	AddTreatment(context.Context, *domain.TreatmentRecord) error
}

type PestDiseaseHandler struct {
	useCases PestDiseaseUseCases
}

type PestDiseaseRequest struct {
	FoundAt     string                 `json:"tanggal_ditemukan"`
	PestDisease string                 `json:"jenis_hama_penyakit"`
	Severity    domain.TingkatSerangan `json:"tingkat_serangan"`
}

type TreatmentRequest struct {
	TreatedAt string                  `json:"tanggal_penanganan,omitempty"`
	Action    *string                 `json:"tindakan_penanganan"`
	Status    domain.StatusPenanganan `json:"status_penanganan"`
}

func NewPestDiseaseHandler(useCases PestDiseaseUseCases) *PestDiseaseHandler {
	return &PestDiseaseHandler{useCases: useCases}
}

func (h *PestDiseaseHandler) ListByLand(w http.ResponseWriter, r *http.Request) {
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
	filter := domain.IncidentFilter{
		Status:   r.URL.Query().Get("status_penanganan"),
		Severity: r.URL.Query().Get("tingkat_serangan"),
		From:     from, To: to,
	}
	result, err := h.useCases.ListByLand(r.Context(), chi.URLParam(r, "id"), filter, page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Daftar insiden hama dan penyakit berhasil diambil", result)
}

func (h *PestDiseaseHandler) Get(w http.ResponseWriter, r *http.Request) {
	item, err := h.useCases.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data insiden berhasil diambil", item)
}

func (h *PestDiseaseHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request PestDiseaseRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	foundAt, err := time.Parse("2006-01-02", request.FoundAt)
	if err != nil {
		writeModuleError(w, r, domain.ErrInvalid)
		return
	}
	item := &domain.PestDiseaseIncident{
		LandID: chi.URLParam(r, "id"), FoundAt: foundAt,
		PestDisease: request.PestDisease, Severity: request.Severity,
	}
	if err := h.useCases.Create(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	created, err := h.useCases.Get(r.Context(), item.ID)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Insiden hama atau penyakit berhasil dicatat", created)
}

func (h *PestDiseaseHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request PestDiseaseRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	id := chi.URLParam(r, "id")
	foundAt, err := time.Parse("2006-01-02", request.FoundAt)
	if err != nil {
		writeModuleError(w, r, domain.ErrInvalid)
		return
	}
	item := &domain.PestDiseaseIncident{
		ID: id, FoundAt: foundAt,
		PestDisease: request.PestDisease, Severity: request.Severity,
	}
	updated, err := h.useCases.Update(r.Context(), item)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data insiden berhasil diperbarui", updated)
}

func (h *PestDiseaseHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

func (h *PestDiseaseHandler) ListTreatments(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	result, err := h.useCases.ListTreatments(r.Context(), chi.URLParam(r, "id"), page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Histori penanganan berhasil diambil", result)
}

func (h *PestDiseaseHandler) AddTreatment(w http.ResponseWriter, r *http.Request) {
	var request TreatmentRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	var treatedAt time.Time
	if value := strings.TrimSpace(request.TreatedAt); value != "" {
		parsed, err := time.Parse(time.RFC3339, value)
		if err != nil {
			writeModuleError(w, r, domain.ErrInvalid)
			return
		}
		treatedAt = parsed
	}
	adminID, _ := r.Context().Value(middleware.UserIDKey).(string)
	item := &domain.TreatmentRecord{
		IncidentID: chi.URLParam(r, "id"), TreatedAt: treatedAt,
		Action: request.Action, Status: request.Status,
	}
	if adminID != "" {
		item.AdminID = &adminID
	}
	if err := h.useCases.AddTreatment(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Catatan penanganan berhasil ditambahkan", item)
}
