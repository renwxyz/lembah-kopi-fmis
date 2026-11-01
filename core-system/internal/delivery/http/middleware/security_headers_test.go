package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSecurityHeaders(t *testing.T) {
	handler := SecurityHeaders(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	t.Run("sets default security headers", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Header().Get("X-Content-Type-Options") != "nosniff" {
			t.Fatalf("X-Content-Type-Options = %s, want nosniff", rec.Header().Get("X-Content-Type-Options"))
		}
		if rec.Header().Get("X-Frame-Options") != "DENY" {
			t.Fatalf("X-Frame-Options = %s, want DENY", rec.Header().Get("X-Frame-Options"))
		}
		if rec.Header().Get("Referrer-Policy") != "strict-origin-when-cross-origin" {
			t.Fatalf("Referrer-Policy = %s, want strict-origin-when-cross-origin", rec.Header().Get("Referrer-Policy"))
		}
		if rec.Header().Get("Strict-Transport-Security") != "" {
			t.Fatalf("HSTS header set unexpectedly on plain HTTP request")
		}
	})

	t.Run("sets HSTS header when accessed over HTTPS proxy", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("X-Forwarded-Proto", "https")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if hsts := rec.Header().Get("Strict-Transport-Security"); hsts != "max-age=31536000; includeSubDomains" {
			t.Fatalf("HSTS = %s, want max-age=31536000; includeSubDomains", hsts)
		}
	})
}

