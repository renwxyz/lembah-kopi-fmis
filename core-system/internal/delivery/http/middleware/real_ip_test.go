package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRealIPMiddleware(t *testing.T) {
	tests := []struct {
		name       string
		remoteAddr string
		headers    map[string]string
		wantIP     string
	}{
		{
			name:       "remote addr fallback",
			remoteAddr: "192.0.2.1:12345",
			headers:    nil,
			wantIP:     "192.0.2.1",
		},
		{
			name:       "x-real-ip precedence over remote addr",
			remoteAddr: "172.18.0.2:54321",
			headers: map[string]string{
				"X-Real-IP": "203.0.113.195",
			},
			wantIP: "203.0.113.195",
		},
		{
			name:       "cf-connecting-ip precedence",
			remoteAddr: "172.18.0.2:54321",
			headers: map[string]string{
				"CF-Connecting-IP": "198.51.100.42",
				"X-Real-IP":        "203.0.113.195",
			},
			wantIP: "198.51.100.42",
		},
		{
			name:       "x-forwarded-for first client ip",
			remoteAddr: "172.18.0.2:54321",
			headers: map[string]string{
				"X-Forwarded-For": "203.0.113.50, 198.51.100.20, 172.18.0.1",
			},
			wantIP: "203.0.113.50",
		},
		{
			name:       "invalid ip format in header falls back",
			remoteAddr: "192.0.2.1:12345",
			headers: map[string]string{
				"X-Real-IP": "malicious_string_or_sql_injection",
			},
			wantIP: "192.0.2.1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.RemoteAddr = tt.remoteAddr
			for k, v := range tt.headers {
				req.Header.Set(k, v)
			}

			var capturedIP string
			handler := RealIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				capturedIP = GetClientIP(r)
			}))

			rec := httptest.NewRecorder()
			handler.ServeHTTP(rec, req)

			if capturedIP != tt.wantIP {
				t.Fatalf("capturedIP = %s, want %s", capturedIP, tt.wantIP)
			}
		})
	}
}

