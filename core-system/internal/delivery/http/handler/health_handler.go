package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

type DatabasePinger interface {
	PingContext(ctx context.Context) error
}

type HealthHandler struct {
	db DatabasePinger
}

func NewHealthHandler(db DatabasePinger) *HealthHandler {
	return &HealthHandler{db: db}
}

type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Checks    map[string]string `json:"checks,omitempty"`
}

// Liveness handles GET /healthz (checks if HTTP server process is running)
func (h *HealthHandler) Liveness(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(HealthResponse{
		Status:    "UP",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

// Readiness handles GET /readyz (checks dependencies like database connectivity)
func (h *HealthHandler) Readiness(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	checks := make(map[string]string)
	isReady := true

	if h.db != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()
		if err := h.db.PingContext(ctx); err != nil {
			checks["database"] = "DOWN: " + err.Error()
			isReady = false
		} else {
			checks["database"] = "UP"
		}
	} else {
		checks["database"] = "NOT_CONFIGURED"
	}

	statusCode := http.StatusOK
	statusStr := "UP"
	if !isReady {
		statusCode = http.StatusServiceUnavailable
		statusStr = "DOWN"
	}

	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(HealthResponse{
		Status:    statusStr,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Checks:    checks,
	})
}

