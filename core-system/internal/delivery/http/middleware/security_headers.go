package middleware

import "net/http"

// SecurityHeaders adds baseline HTTP security headers for production defense:
// - X-Content-Type-Options: nosniff (prevents MIME sniffing)
// - X-Frame-Options: DENY (clickjacking defense)
// - Referrer-Policy: strict-origin-when-cross-origin
// - Strict-Transport-Security: max-age=31536000; includeSubDomains (forces HTTPS)
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		// If accessed via HTTPS or behind SSL proxy
		if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}

		next.ServeHTTP(w, r)
	})
}

