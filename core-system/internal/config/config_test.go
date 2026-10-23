package config

import "testing"

func TestLoadRequiresDatabaseAndStrongJWTSecret(t *testing.T) {
	t.Setenv("DATABASE_URL", "")
	t.Setenv("JWT_SECRET", "")
	if _, err := Load(); err == nil {
		t.Fatal("Load() succeeded without required configuration")
	}

	t.Setenv("DATABASE_URL", "postgres://localhost/test?sslmode=disable")
	t.Setenv("JWT_SECRET", "short")
	if _, err := Load(); err == nil {
		t.Fatal("Load() succeeded with a short JWT secret")
	}
}

func TestSplitOriginsTrimsAndIgnoresEmptyValues(t *testing.T) {
	got := splitOrigins(" https://app.example, ,https://admin.example ")
	if len(got) != 2 || got[0] != "https://app.example" || got[1] != "https://admin.example" {
		t.Fatalf("splitOrigins() = %#v, want two trimmed origins", got)
	}
}
