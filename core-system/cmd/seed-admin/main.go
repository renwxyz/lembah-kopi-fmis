package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"flag"
	"log"
	"os"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	var (
		dbURLFlag    = flag.String("db", "", "PostgreSQL database connection URL (or DATABASE_URL env)")
		usernameFlag = flag.String("username", "", "Superadmin username (or ADMIN_USERNAME env)")
		emailFlag    = flag.String("email", "", "Superadmin email (or ADMIN_EMAIL env)")
		passwordFlag = flag.String("password", "", "Superadmin password (or ADMIN_PASSWORD env)")
		nameFlag     = flag.String("name", "", "Superadmin full name (or ADMIN_NAME env)")
	)
	flag.Parse()

	dbURL := getVal(*dbURLFlag, "DATABASE_URL", "")
	username := getVal(*usernameFlag, "ADMIN_USERNAME", "superadmin")
	email := getVal(*emailFlag, "ADMIN_EMAIL", "admin@lembahkopi.id")
	password := getVal(*passwordFlag, "ADMIN_PASSWORD", "")
	name := getVal(*nameFlag, "ADMIN_NAME", "Super Admin FMIS")

	if dbURL == "" {
		log.Fatal("ERROR: Database URL wajib ditentukan via flag -db atau env DATABASE_URL")
	}

	if password == "" {
		log.Fatal("ERROR: Password wajib ditentukan via flag -password atau env ADMIN_PASSWORD")
	}

	if len(password) < 8 {
		log.Fatal("ERROR: Password minimal harus 8 karakter untuk keamanan production")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("Gagal membuka koneksi database: %v", err)
	}
	defer db.Close()

	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("Gagal menghubungi database PostgreSQL: %v", err)
	}

	// 1. Cek apakah admin sudah ada berdasarkan username atau email
	var existingID string
	err = db.QueryRowContext(ctx, "SELECT id_admin FROM pengguna_admin WHERE username = $1 OR email = $2 LIMIT 1", username, email).Scan(&existingID)
	if err == nil {
		log.Printf("INFO: Admin '%s' atau '%s' sudah terdaftar dengan ID %s. Lewati seeding.", username, email, existingID)
		return
	} else if err != sql.ErrNoRows {
		log.Fatalf("Gagal memeriksa pengguna admin: %v", err)
	}

	// 2. Hash password dengan bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Gagal melakukan hashing password: %v", err)
	}

	// 3. Generate ID Admin
	randomBytes := make([]byte, 8)
	if _, err := rand.Read(randomBytes); err != nil {
		log.Fatalf("Gagal menghasilkan identifier: %v", err)
	}
	adminID := "ADM-" + strings.ToUpper(hex.EncodeToString(randomBytes))

	// 4. Insert superadmin
	query := `
		INSERT INTO pengguna_admin (
			id_admin, username, email, password_hash, nama_lengkap, role, status_aktif, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, 'SUPER_ADMIN', TRUE, NOW(), NOW())
	`
	_, err = db.ExecContext(ctx, query, adminID, username, email, string(hashedPassword), name)
	if err != nil {
		log.Fatalf("Gagal menyimpan data superadmin: %v", err)
	}

	log.Printf("SUCCESS: Super Admin production berhasil dibuat!")
	log.Printf("  ID Admin    : %s", adminID)
	log.Printf("  Username    : %s", username)
	log.Printf("  Email       : %s", email)
	log.Printf("  Role        : SUPER_ADMIN")
	log.Printf("  Status Aktif: TRUE")
}

func getVal(flagVal, envKey, fallback string) string {
	if flagVal != "" {
		return flagVal
	}
	if envVal := os.Getenv(envKey); envVal != "" {
		return envVal
	}
	return fallback
}
