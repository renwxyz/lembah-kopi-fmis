package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	DatabaseURL        string
	JWTSecret          string
	HTTPAddress        string
	CORSAllowedOrigins []string
}

func Load() (Config, error) {
	config := Config{
		DatabaseURL:        strings.TrimSpace(os.Getenv("DATABASE_URL")),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		HTTPAddress:        strings.TrimSpace(os.Getenv("HTTP_ADDRESS")),
		CORSAllowedOrigins: splitOrigins(os.Getenv("CORS_ALLOWED_ORIGINS")),
	}
	if config.DatabaseURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}
	if len(config.JWTSecret) < 32 {
		return Config{}, fmt.Errorf("JWT_SECRET must contain at least 32 characters")
	}
	if config.HTTPAddress == "" {
		config.HTTPAddress = ":8080"
	}
	return config, nil
}

func splitOrigins(value string) []string {
	origins := make([]string, 0)
	for _, origin := range strings.Split(value, ",") {
		if origin = strings.TrimSpace(origin); origin != "" {
			origins = append(origins, origin)
		}
	}
	return origins
}
