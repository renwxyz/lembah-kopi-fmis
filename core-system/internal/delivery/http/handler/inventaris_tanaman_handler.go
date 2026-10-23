package handler

import (
	"context"
	"net/http"

	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
)

type CropInventoryUseCases interface {
	ListByLand(ctx context.Context, landID string) ([]domain.CropInventory, error)
	Get(ctx context.Context, id string) (*domain.CropInventory, error)
	Create(ctx context.Context, inventory *domain.CropInventory) error
	Update(ctx context.Context, inventory *domain.CropInventory) (*domain.CropInventory, error)
	Delete(ctx context.Context, id string) error
}

type CropInventoryHandler struct {
	useCases CropInventoryUseCases
}

type CropInventoryRequest struct {
	Variety  domain.CoffeeVariety `json:"varietas"`
	AgeGroup domain.PlantAgeGroup `json:"kelompok_usia"`
}

func NewCropInventoryHandler(useCases CropInventoryUseCases) *CropInventoryHandler {
	return &CropInventoryHandler{useCases: useCases}
}

// ListByLand godoc
func (h *CropInventoryHandler) ListByLand(w http.ResponseWriter, r *http.Request) {
	items, err := h.useCases.ListByLand(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Inventaris lahan berhasil diambil", items)
}

// Create godoc
func (h *CropInventoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request CropInventoryRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	inventory := inventoryFromRequest(request, "", chi.URLParam(r, "id"))
	if err := h.useCases.Create(r.Context(), inventory); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Inventaris tanaman berhasil ditambahkan", inventory)
}

// Get godoc
func (h *CropInventoryHandler) Get(w http.ResponseWriter, r *http.Request) {
	inventory, err := h.useCases.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data inventaris berhasil diambil", inventory)
}

// Update godoc
func (h *CropInventoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request CropInventoryRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	id := chi.URLParam(r, "id")
	inventory := inventoryFromRequest(request, id, "")
	updated, err := h.useCases.Update(r.Context(), inventory)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Inventaris tanaman berhasil diperbarui", updated)
}

// Delete godoc
func (h *CropInventoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

func inventoryFromRequest(request CropInventoryRequest, id, pathLandID string) *domain.CropInventory {
	return &domain.CropInventory{
		ID: id, LandID: pathLandID, Variety: request.Variety, AgeGroup: request.AgeGroup,
	}
}
