package problem

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"runtime/debug"

	chiMiddleware "github.com/go-chi/chi/v5/middleware"
)

type Details struct {
	Type     string `json:"type"`
	Title    string `json:"title"`
	Status   int    `json:"status"`
	Detail   string `json:"detail,omitempty"`
	Instance string `json:"instance,omitempty"`
}

func Write(w http.ResponseWriter, r *http.Request, status int, problemType, title, detail string) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	details := Details{
		Type:   problemType,
		Title:  title,
		Status: status,
		Detail: detail,
	}
	if r != nil {
		details.Instance = r.URL.Path
	}
	_ = json.NewEncoder(w).Encode(details)
}

func Recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		wrapped := chiMiddleware.NewWrapResponseWriter(w, r.ProtoMajor)
		defer func() {
			recovered := recover()
			if recovered == nil {
				return
			}
			if recovered == http.ErrAbortHandler {
				panic(recovered)
			}
			log.Printf("HTTP handler panic: %v\n%s", recovered, debug.Stack())
			if wrapped.Status() == 0 {
				Write(wrapped, r, http.StatusInternalServerError, "https://api.lembahkopi.id/problems/internal-error", "Internal server error", "An unexpected error occurred.")
			}
		}()
		next.ServeHTTP(wrapped, r)
	})
}
