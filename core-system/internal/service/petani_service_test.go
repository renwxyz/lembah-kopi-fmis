package service

import (
	"errors"
	"strings"
	"testing"

	"lembah-kopi/core-system/internal/domain"
)

func TestValidateFarmerRequiresDatabaseCompatibleFields(t *testing.T) {
	tests := []struct {
		name    string
		farmer  domain.Farmer
		wantErr bool
	}{
		{name: "valid farmer", farmer: domain.Farmer{FullName: "Petani", PhoneNumber: "081234567890"}},
		{name: "missing phone", farmer: domain.Farmer{FullName: "Petani"}, wantErr: true},
		{name: "name exceeds varchar limit", farmer: domain.Farmer{FullName: strings.Repeat("a", 101), PhoneNumber: "081234567890"}, wantErr: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateFarmer(&test.farmer)
			if (err != nil) != test.wantErr {
				t.Fatalf("validateFarmer() error = %v, wantErr %v", err, test.wantErr)
			}
			if test.wantErr && !errors.Is(err, domain.ErrInvalid) {
				t.Fatalf("error %v does not wrap ErrInvalid", err)
			}
		})
	}
}

func TestNewIdentifierFitsMigrationColumn(t *testing.T) {
	id, err := newIdentifier("PTN-")
	if err != nil {
		t.Fatalf("newIdentifier() error = %v", err)
	}
	if len(id) > 20 {
		t.Fatalf("generated ID length = %d, exceeds VARCHAR(20)", len(id))
	}
}
