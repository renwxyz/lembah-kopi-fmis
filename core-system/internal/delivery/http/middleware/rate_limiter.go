package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"lembah-kopi/core-system/internal/delivery/http/problem"
)

type clientRecord struct {
	tokens     float64
	lastRefill time.Time
}

// IPRateLimiter implements an in-memory token-bucket rate limiter per IP address.
type IPRateLimiter struct {
	mu           sync.Mutex
	rate         float64 // tokens per second
	capacity     float64 // max token burst
	clients      map[string]*clientRecord
	cleanupEvery time.Duration
	lastCleanup  time.Time
}

// NewIPRateLimiter creates a new rate limiter.
// rps: tokens replenished per second.
// burst: maximum burst capacity.
func NewIPRateLimiter(rps float64, burst int) *IPRateLimiter {
	return &IPRateLimiter{
		rate:         rps,
		capacity:     float64(burst),
		clients:      make(map[string]*clientRecord),
		cleanupEvery: 5 * time.Minute,
		lastCleanup:  time.Now(),
	}
}

// Allow checks if the given IP is allowed to proceed.
func (l *IPRateLimiter) Allow(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()

	// Periodic cleanup of stale IPs (inactive > 10 min)
	if now.Sub(l.lastCleanup) > l.cleanupEvery {
		for k, v := range l.clients {
			if now.Sub(v.lastRefill) > 10*time.Minute {
				delete(l.clients, k)
			}
		}
		l.lastCleanup = now
	}

	record, exists := l.clients[ip]
	if !exists {
		l.clients[ip] = &clientRecord{
			tokens:     l.capacity - 1,
			lastRefill: now,
		}
		return true
	}

	// Refill tokens based on elapsed time
	elapsed := now.Sub(record.lastRefill).Seconds()
	record.tokens += elapsed * l.rate
	if record.tokens > l.capacity {
		record.tokens = l.capacity
	}
	record.lastRefill = now

	if record.tokens >= 1.0 {
		record.tokens -= 1.0
		return true
	}

	return false
}

// LimitHandler creates a middleware that restricts requests based on client IP.
func (l *IPRateLimiter) LimitHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := GetClientIP(r)
		if !l.Allow(ip) {
			w.Header().Set("Retry-After", "60")
			problem.Write(
				w, r, http.StatusTooManyRequests,
				"https://api.lembahkopi.id/problems/too-many-requests",
				"Too Many Requests",
				fmt.Sprintf("Rate limit exceeded for IP %s. Please try again later.", ip),
			)
			return
		}
		next.ServeHTTP(w, r)
	})
}

