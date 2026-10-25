package handler

import (
	"context"
	"net/http"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

type AuditUseCases interface {
	List(context.Context, domain.AuditFilter, int, int) (*domain.Page[domain.AuditLog], error)
}

type AuditHandler struct {
	useCases AuditUseCases
}

func NewAuditHandler(useCases AuditUseCases) *AuditHandler {
	return &AuditHandler{useCases: useCases}
}

func (h *AuditHandler) List(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	from, err := parseDateQuery(r, "from")
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	to, err := parseDateQuery(r, "to")
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	if to != nil {
		end := to.Add(24 * time.Hour)
		to = &end
	}
	query := r.URL.Query()
	filter := domain.AuditFilter{
		Username: strings.TrimSpace(query.Get("username")),
		Action:   strings.ToUpper(strings.TrimSpace(query.Get("aksi"))),
		Resource: strings.TrimSpace(query.Get("resource")),
		Query:    strings.TrimSpace(query.Get("q")),
		From:     from,
		To:       to,
	}
	result, err := h.useCases.List(r.Context(), filter, page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Audit trail berhasil diambil", result)
}

