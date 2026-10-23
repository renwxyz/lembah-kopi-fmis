package handler

import (
	"context"
	"net/http"

	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
)

type FarmerUseCases interface {
	List(ctx context.Context, search string, page, pageSize int) (*domain.Page[domain.Farmer], error)
	Get(ctx context.Context, id string) (*domain.Farmer, error)
	Create(ctx context.Context, farmer *domain.Farmer) error
	Update(ctx context.Context, farmer *domain.Farmer) (*domain.Farmer, error)
	Delete(ctx context.Context, id string) error
}

type FarmerHandler struct {
	useCases FarmerUseCases
}

type FarmerRequest struct {
	FullName    string `json:"nama_lengkap"`
	PhoneNumber string `json:"no_hp"`
}

func NewFarmerHandler(useCases FarmerUseCases) *FarmerHandler {
	return &FarmerHandler{useCases: useCases}
}

// List godoc
func (h *FarmerHandler) List(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	result, err := h.useCases.List(r.Context(), r.URL.Query().Get("search"), page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Daftar petani berhasil diambil", result)
}

// Get godoc
func (h *FarmerHandler) Get(w http.ResponseWriter, r *http.Request) {
	farmer, err := h.useCases.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data petani berhasil diambil", farmer)
}

// Create godoc
func (h *FarmerHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request FarmerRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	farmer := &domain.Farmer{FullName: request.FullName, PhoneNumber: request.PhoneNumber}
	if err := h.useCases.Create(r.Context(), farmer); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Petani berhasil ditambahkan", farmer)
}

// Update godoc
func (h *FarmerHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request FarmerRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	farmer := &domain.Farmer{ID: chi.URLParam(r, "id"), FullName: request.FullName, PhoneNumber: request.PhoneNumber}
	updated, err := h.useCases.Update(r.Context(), farmer)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data petani berhasil diperbarui", updated)
}

// Delete godoc
func (h *FarmerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}
