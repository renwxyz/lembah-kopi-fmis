package handler

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"lembah-kopi/core-system/internal/delivery/http/problem"
	"lembah-kopi/core-system/internal/domain"
)

type successResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

func writeSuccessJSON(w http.ResponseWriter, status int, response successResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(response)
}

func writeSuccessResponse(w http.ResponseWriter, status int, message string, data any) {
	writeSuccessJSON(w, status, successResponse{Success: true, Message: message, Data: data})
}

func writeNoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

func writeModuleError(w http.ResponseWriter, r *http.Request, err error) {
	switch {
	case errors.Is(err, domain.ErrInvalid):
		problem.Write(w, r, http.StatusBadRequest, "https://api.lembahkopi.id/problems/invalid-request", "Invalid request", err.Error())
	case errors.Is(err, domain.ErrUnauthorized):
		problem.Write(w, r, http.StatusUnauthorized, "https://api.lembahkopi.id/problems/unauthorized", "Unauthorized", err.Error())
	case errors.Is(err, domain.ErrNotFound):
		problem.Write(w, r, http.StatusNotFound, "https://api.lembahkopi.id/problems/not-found", "Resource not found", err.Error())
	case errors.Is(err, domain.ErrConflict):
		problem.Write(w, r, http.StatusConflict, "https://api.lembahkopi.id/problems/conflict", "Request conflict", err.Error())
	default:
		slog.Error("request failed", "error", err, "path", r.URL.Path)
		problem.Write(w, r, http.StatusInternalServerError, "https://api.lembahkopi.id/problems/internal-error", "Internal server error", "An unexpected error occurred.")
	}
}

func parseTimestampQuery(r *http.Request, key string) (*time.Time, error) {
	value := strings.TrimSpace(r.URL.Query().Get(key))
	if value == "" {
		return nil, nil
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return nil, domain.ErrInvalid
	}
	return &parsed, nil
}

func parseDateQuery(r *http.Request, key string) (*time.Time, error) {
	value := strings.TrimSpace(r.URL.Query().Get(key))
	if value == "" {
		return nil, nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, domain.ErrInvalid
	}
	return &parsed, nil
}

func queryPagination(r *http.Request) (int, int, error) {
	page := 1
	pageSize := 20
	var err error
	if value := r.URL.Query().Get("page"); value != "" {
		page, err = strconv.Atoi(value)
		if err != nil {
			return 0, 0, domain.ErrInvalid
		}
	}
	if value := r.URL.Query().Get("page_size"); value != "" {
		pageSize, err = strconv.Atoi(value)
		if err != nil {
			return 0, 0, domain.ErrInvalid
		}
	}
	return page, pageSize, nil
}

func decodeRequest(w http.ResponseWriter, r *http.Request, target any) error {
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		return domain.ErrInvalid
	}
	var trailing any
	if err := decoder.Decode(&trailing); !errors.Is(err, io.EOF) {
		return domain.ErrInvalid
	}
	return nil
}
