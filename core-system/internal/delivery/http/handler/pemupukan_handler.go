package handler

import (
	"context"
	"net/http"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
)

type FertilizationUseCases interface {
	ListByLand(context.Context, string, int, int) (*domain.Page[domain.Fertilization], error)
	Get(context.Context, string) (*domain.Fertilization, error)
	Create(context.Context, *domain.Fertilization) error
	Update(context.Context, *domain.Fertilization) (*domain.Fertilization, error)
	Delete(context.Context, string) error
}

type FertilizationHandler struct {
	useCases FertilizationUseCases
}

type FertilizationRequest struct {
	AppliedAt  string  `json:"tanggal_aplikasi"`
	Fertilizer string  `json:"jenis_pupuk"`
	DoseKG     float64 `json:"dosis_kg"`
}

func NewFertilizationHandler(useCases FertilizationUseCases) *FertilizationHandler {
	return &FertilizationHandler{useCases: useCases}
}

func (h *FertilizationHandler) ListByLand(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	result, err := h.useCases.ListByLand(r.Context(), chi.URLParam(r, "id"), page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Riwayat pemupukan berhasil diambil", result)
}

func (h *FertilizationHandler) Get(w http.ResponseWriter, r *http.Request) {
	item, err := h.useCases.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data aplikasi pemupukan berhasil diambil", item)
}

func (h *FertilizationHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request FertilizationRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	item, err := fertilizationFromRequest(request)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	item.LandID = chi.URLParam(r, "id")
	if err := h.useCases.Create(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Aplikasi pemupukan berhasil dicatat", item)
}

func (h *FertilizationHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request FertilizationRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	item, err := fertilizationFromRequest(request)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	item.ID = chi.URLParam(r, "id")
	updated, err := h.useCases.Update(r.Context(), item)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Aplikasi pemupukan berhasil diperbarui", updated)
}

func (h *FertilizationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

func fertilizationFromRequest(request FertilizationRequest) (*domain.Fertilization, error) {
	date := strings.TrimSpace(request.AppliedAt)
	appliedAt, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, domain.ErrInvalid
	}
	return &domain.Fertilization{AppliedAt: appliedAt, Fertilizer: request.Fertilizer, DoseKG: request.DoseKG}, nil
}
