package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"lembah-kopi/core-system/internal/delivery/http/problem"
	"lembah-kopi/core-system/internal/domain"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey   contextKey = "userID"
	UserRoleKey contextKey = "userRole"
)

func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				problem.Write(w, r, http.StatusUnauthorized, "https://api.lembahkopi.id/problems/unauthorized", "Unauthorized", "An Authorization header is required.")
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				problem.Write(w, r, http.StatusUnauthorized, "https://api.lembahkopi.id/problems/unauthorized", "Unauthorized", "Authorization must use the Bearer scheme.")
				return
			}

			tokenString := parts[1]
			token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, errors.New("metode signing tidak sesuai")
				}
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				problem.Write(w, r, http.StatusUnauthorized, "https://api.lembahkopi.id/problems/unauthorized", "Unauthorized", "The access token is invalid or expired.")
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				problem.Write(w, r, http.StatusUnauthorized, "https://api.lembahkopi.id/problems/unauthorized", "Unauthorized", "The access token claims are invalid.")
				return
			}

			userID, _ := claims["sub"].(string)
			userRole, _ := claims["role"].(string)

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, UserRoleKey, domain.AdminRole(userRole))

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireRole(allowedRoles ...domain.AdminRole) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := r.Context().Value(UserRoleKey).(domain.AdminRole)
			if !ok {
				problem.Write(w, r, http.StatusForbidden, "https://api.lembahkopi.id/problems/forbidden", "Forbidden", "You do not have permission to access this resource.")
				return
			}

			for _, allowed := range allowedRoles {
				if role == allowed {
					next.ServeHTTP(w, r)
					return
				}
			}

			problem.Write(w, r, http.StatusForbidden, "https://api.lembahkopi.id/problems/forbidden", "Forbidden", "You do not have permission to access this resource.")
		})
	}
}
