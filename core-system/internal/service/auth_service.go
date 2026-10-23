package service

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"time"

	"lembah-kopi/core-system/internal/domain"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type authService struct {
	repository domain.AuthRepository
	jwtSecret  []byte
	tokenTTL   time.Duration
}

func NewAuthService(repository domain.AuthRepository, jwtSecret string) domain.AuthService {
	return &authService{repository: repository, jwtSecret: []byte(jwtSecret), tokenTTL: 24 * time.Hour}
}

func (s *authService) Login(ctx context.Context, request domain.LoginRequest) (*domain.LoginResponseData, error) {
	if request.UsernameOrEmail == "" || request.Password == "" {
		return nil, fmt.Errorf("%w: username_or_email dan password wajib diisi", domain.ErrInvalid)
	}
	admin, err := s.repository.GetByUsernameOrEmail(ctx, request.UsernameOrEmail)
	if errors.Is(err, domain.ErrNotFound) {
		return nil, domain.ErrUnauthorized
	}
	if err != nil {
		return nil, err
	}
	if bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(request.Password)) != nil {
		return nil, domain.ErrUnauthorized
	}
	if !admin.StatusAktif {
		return nil, domain.ErrUnauthorized
	}
	now := time.Now()
	expiresAt := now.Add(s.tokenTTL)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  admin.IDAdmin,
		"role": string(admin.Role),
		"iat":  now.Unix(),
		"exp":  expiresAt.Unix(),
	})
	accessToken, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("sign access token: %w", err)
	}
	if err := s.repository.UpdateLastLogin(ctx, admin.IDAdmin, now); err != nil {
		return nil, err
	}
	admin.PasswordHash = ""
	return &domain.LoginResponseData{
		TokenType: "Bearer", AccessToken: accessToken, ExpiresAt: expiresAt, User: *admin,
	}, nil
}

func (s *authService) GetProfile(ctx context.Context, id string) (*domain.PenggunaAdmin, error) {
	admin, err := s.repository.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	admin.PasswordHash = ""
	return admin, nil
}

func (s *authService) ChangePassword(ctx context.Context, id string, request domain.ChangePasswordRequest) error {
	if request.PasswordLama == "" || request.PasswordBaru == "" || request.KonfirmasiPasswordBaru == "" {
		return fmt.Errorf("%w: seluruh field password wajib diisi", domain.ErrInvalid)
	}
	admin, err := s.repository.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(request.PasswordLama)) != nil {
		return domain.ErrUnauthorized
	}
	if len(request.PasswordBaru) < 12 || len(request.PasswordBaru) > 72 || request.PasswordBaru != request.KonfirmasiPasswordBaru {
		return fmt.Errorf("%w: password baru harus 12-72 byte dan konfirmasi harus cocok", domain.ErrInvalid)
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(request.PasswordBaru), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}
	return s.repository.UpdatePassword(ctx, id, string(passwordHash))
}

func (s *authService) CreateAdmin(ctx context.Context, request domain.CreateAdminRequest) (*domain.PenggunaAdmin, error) {
	if request.Role != domain.RoleSuperAdmin && request.Role != domain.RoleAdminKelompokTani {
		return nil, fmt.Errorf("%w: role admin tidak dikenal", domain.ErrInvalid)
	}
	if request.Username == "" || len(request.Username) > 50 ||
		request.Email == "" || len(request.Email) > 100 ||
		request.NamaLengkap == "" || len(request.NamaLengkap) > 100 ||
		len(request.Password) < 12 || len(request.Password) > 72 {
		return nil, fmt.Errorf("%w: data admin tidak lengkap atau password harus 12-72 byte", domain.ErrInvalid)
	}
	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil || parsedEmail.Address != request.Email {
		return nil, fmt.Errorf("%w: email tidak valid", domain.ErrInvalid)
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}
	id, err := newIdentifier("ADM-")
	if err != nil {
		return nil, err
	}
	admin := &domain.PenggunaAdmin{
		IDAdmin: id, Username: request.Username, Email: request.Email,
		PasswordHash: string(passwordHash), NamaLengkap: request.NamaLengkap,
		Role: request.Role, StatusAktif: true,
	}
	if err := s.repository.Create(ctx, admin); err != nil {
		return nil, err
	}
	admin.PasswordHash = ""
	return admin, nil
}
