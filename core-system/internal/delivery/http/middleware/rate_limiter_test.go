package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestIPRateLimiter(t *testing.T) {
	// Limiter with 2 requests capacity, 0.5 per second refill
	limiter := NewIPRateLimiter(0.5, 2)
	handler := limiter.LimitHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	ip := "198.51.100.1"

	sendReq := func() int {
		req := httptest.NewRequest(http.MethodPost, "/auth/login", nil)
		req.Header.Set("X-Real-IP", ip)
		rec := httptest.NewRecorder()
		RealIP(handler).ServeHTTP(rec, req)
		return rec.Code
	}

	// 1st request -> OK
	if code := sendReq(); code != http.StatusOK {
		t.Fatalf("1st request code = %d, want %d", code, http.StatusOK)
	}

	// 2nd request -> OK (capacity 2 consumed)
	if code := sendReq(); code != http.StatusOK {
		t.Fatalf("2nd request code = %d, want %d", code, http.StatusOK)
	}

	// 3rd request immediately -> 429 Too Many Requests
	if code := sendReq(); code != http.StatusTooManyRequests {
		t.Fatalf("3rd request code = %d, want %d", code, http.StatusTooManyRequests)
	}

	// Other IP is unaffected
	reqOther := httptest.NewRequest(http.MethodPost, "/auth/login", nil)
	reqOther.Header.Set("X-Real-IP", "203.0.113.88")
	recOther := httptest.NewRecorder()
	RealIP(handler).ServeHTTP(recOther, reqOther)
	if recOther.Code != http.StatusOK {
		t.Fatalf("other IP request code = %d, want %d", recOther.Code, http.StatusOK)
	}
}

