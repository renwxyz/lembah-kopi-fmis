package domain

import (
	"context"
	"time"
)

type AdminRole string

const (
	RoleSuperAdmin        AdminRole = "SUPER_ADMIN"
	RoleAdminKelompokTani AdminRole = "ADMIN_KELOMPOK_TANI"
)

type PenggunaAdmin struct {
	IDAdmin      string     `json:"id_admin"`
	Username     string     `json:"username"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	NamaLengkap  string     `json:"nama_lengkap"`
	Role         AdminRole  `json:"role"`
	StatusAktif  bool       `json:"status_aktif"`
	LastLoginAt  *time.Time `json:"last_login_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type LoginRequest struct {
	UsernameOrEmail string `json:"username_or_email" example:"admin_glodogan"`
	Password        string `json:"password" example:"replace-with-a-strong-password"`
}

type LoginResponseData struct {
	TokenType   string        `json:"token_type" example:"Bearer"`
	AccessToken string        `json:"access_token"`
	ExpiresAt   time.Time     `json:"expires_at"`
	User        PenggunaAdmin `json:"user"`
}

type ChangePasswordRequest struct {
	PasswordLama           string `json:"password_lama"`
	PasswordBaru           string `json:"password_baru"`
	KonfirmasiPasswordBaru string `json:"konfirmasi_password_baru"`
}

type CreateAdminRequest struct {
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	Password    string    `json:"password"`
	NamaLengkap string    `json:"nama_lengkap"`
	Role        AdminRole `json:"role"`
}

type AuthRepository interface {
	GetByUsernameOrEmail(ctx context.Context, identifier string) (*PenggunaAdmin, error)
	GetByID(ctx context.Context, idAdmin string) (*PenggunaAdmin, error)
	UpdateLastLogin(ctx context.Context, idAdmin string, loginTime time.Time) error
	UpdatePassword(ctx context.Context, idAdmin string, passwordHash string) error
	Create(ctx context.Context, admin *PenggunaAdmin) error
}

type AuthService interface {
	Login(ctx context.Context, req LoginRequest) (*LoginResponseData, error)
	GetProfile(ctx context.Context, idAdmin string) (*PenggunaAdmin, error)
	ChangePassword(ctx context.Context, idAdmin string, req ChangePasswordRequest) error
	CreateAdmin(ctx context.Context, req CreateAdminRequest) (*PenggunaAdmin, error)
}
