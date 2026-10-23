package handler

import (
	"context"
	"net/http"

	"lembah-kopi/core-system/internal/delivery/http/middleware"
	domain "lembah-kopi/core-system/internal/domain"
)

type AuthUseCases interface {
	Login(ctx context.Context, request domain.LoginRequest) (*domain.LoginResponseData, error)
	GetProfile(ctx context.Context, id string) (*domain.PenggunaAdmin, error)
	ChangePassword(ctx context.Context, id string, request domain.ChangePasswordRequest) error
	CreateAdmin(ctx context.Context, request domain.CreateAdminRequest) (*domain.PenggunaAdmin, error)
}

type AuthHandler struct {
	useCases AuthUseCases
}

func NewAuthHandler(useCases AuthUseCases) *AuthHandler {
	return &AuthHandler{useCases: useCases}
}

// Login godoc
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req domain.LoginRequest
	if err := decodeRequest(w, r, &req); err != nil {
		writeModuleError(w, r, err)
		return
	}

	res, err := h.useCases.Login(r.Context(), req)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}

	writeSuccessResponse(w, http.StatusOK, "Login berhasil", res)
}

// GetProfile godoc
func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		writeModuleError(w, r, domain.ErrUnauthorized)
		return
	}

	user, err := h.useCases.GetProfile(r.Context(), userID)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}

	writeSuccessResponse(w, http.StatusOK, "Profil berhasil diambil", user)
}

// ChangePassword godoc
func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		writeModuleError(w, r, domain.ErrUnauthorized)
		return
	}

	var req domain.ChangePasswordRequest
	if err := decodeRequest(w, r, &req); err != nil {
		writeModuleError(w, r, err)
		return
	}

	err := h.useCases.ChangePassword(r.Context(), userID, req)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}

	writeSuccessResponse(w, http.StatusOK, "Kata sandi berhasil diperbarui", nil)
}

// CreateAdmin godoc
func (h *AuthHandler) CreateAdmin(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateAdminRequest
	if err := decodeRequest(w, r, &req); err != nil {
		writeModuleError(w, r, err)
		return
	}

	admin, err := h.useCases.CreateAdmin(r.Context(), req)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}

	writeSuccessResponse(w, http.StatusCreated, "Akun admin berhasil dibuat", admin)
}
