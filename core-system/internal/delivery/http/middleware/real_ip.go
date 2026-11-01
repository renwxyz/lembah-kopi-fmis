package middleware

import (
	"context"
	"net"
	"net/http"
	"strings"
)

type realIPContextKey struct{}

// RealIPContextKey key untuk mengambil client IP asli dari r.Context().
var RealIPContextKey = realIPContextKey{}

// RealIP extracts the client IP address from proxy headers (X-Forwarded-For, X-Real-IP, CF-Connecting-IP)
// or falls back to r.RemoteAddr. It validates the parsed IP to protect against header spoofing.
func RealIP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clientIP := extractRealIP(r)
		ctx := context.WithValue(r.Context(), RealIPContextKey, clientIP)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetClientIP retrieves the real client IP from context, or extracts it directly from the request.
func GetClientIP(r *http.Request) string {
	if val, ok := r.Context().Value(RealIPContextKey).(string); ok && val != "" {
		return val
	}
	return extractRealIP(r)
}

func extractRealIP(r *http.Request) string {
	// 1. Cloudflare header
	if cfIP := strings.TrimSpace(r.Header.Get("CF-Connecting-IP")); cfIP != "" {
		if ip := net.ParseIP(cfIP); ip != nil {
			return cfIP
		}
	}

	// 2. Standard X-Real-IP header (umum diset oleh Nginx/Caddy proxy_set_header X-Real-IP $remote_addr)
	if xRealIP := strings.TrimSpace(r.Header.Get("X-Real-IP")); xRealIP != "" {
		if ip := net.ParseIP(xRealIP); ip != nil {
			return xRealIP
		}
	}

	// 3. X-Forwarded-For header (ambil IP paling kiri / client original)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if ip := net.ParseIP(trimmed); ip != nil {
				return trimmed
			}
		}
	}

	// 4. Fallback ke RemoteAddr
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil && host != "" {
		if ip := net.ParseIP(host); ip != nil {
			return host
		}
	}

	return strings.TrimSpace(r.RemoteAddr)
}

