package handler

import (
	"context"
	"net/http"

	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
)

type TreePopulationUseCases interface {
	GetByLand(ctx context.Context, landID string) (*domain.TreePopulationSummary, error)
	SetForInventory(ctx context.Context, inventoryID string, treeCount int) (*domain.TreePopulationItem, error)
}

type TreePopulationHandler struct {
	useCases TreePopulationUseCases
}

type TreePopulationRequest struct {
	TreeCount int `json:"jumlah_pohon"`
}

func NewTreePopulationHandler(useCases TreePopulationUseCases) *TreePopulationHandler {
	return &TreePopulationHandler{useCases: useCases}
}

// GetByLand godoc
func (h *TreePopulationHandler) GetByLand(w http.ResponseWriter, r *http.Request) {
	summary, err := h.useCases.GetByLand(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Populasi pohon lahan berhasil diambil", summary)
}

// SetForInventory godoc
func (h *TreePopulationHandler) SetForInventory(w http.ResponseWriter, r *http.Request) {
	var request TreePopulationRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	item, err := h.useCases.SetForInventory(r.Context(), chi.URLParam(r, "id"), request.TreeCount)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Populasi pohon blok berhasil diperbarui", item)
}
