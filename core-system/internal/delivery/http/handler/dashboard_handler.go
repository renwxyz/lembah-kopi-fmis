package handler

import (
	"context"
	"net/http"

	"lembah-kopi/core-system/internal/domain"
)

type DashboardUseCases interface {
	GetOverview(context.Context) (*domain.DashboardOverview, error)
}

type DashboardHandler struct {
	useCases DashboardUseCases
}

func NewDashboardHandler(useCases DashboardUseCases) *DashboardHandler {
	return &DashboardHandler{useCases: useCases}
}

func (h *DashboardHandler) GetOverview(w http.ResponseWriter, r *http.Request) {
	overview, err := h.useCases.GetOverview(r.Context())
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Ringkasan dashboard berhasil diambil", overview)
}
