package service

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math"
	"strings"

	"lembah-kopi/core-system/internal/domain"
)

func newIdentifier(prefix string) (string, error) {
	randomBytes := make([]byte, 8)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", fmt.Errorf("generate identifier: %w", err)
	}
	return prefix + strings.ToUpper(hex.EncodeToString(randomBytes)), nil
}

func pagination(page, pageSize int) (int, int, int, error) {
	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 20
	}
	if page < 1 || pageSize < 1 || pageSize > 100 || page-1 > math.MaxInt/pageSize {
		return 0, 0, 0, fmt.Errorf("%w: page harus >= 1 dan page_size harus 1-100", domain.ErrInvalid)
	}
	return page, pageSize, (page - 1) * pageSize, nil
}
