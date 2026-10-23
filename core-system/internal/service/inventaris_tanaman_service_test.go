package service

import (
	"errors"
	"testing"

	"lembah-kopi/core-system/internal/domain"
)

func TestValidateCropInventoryUsesMigrationEnums(t *testing.T) {
	tests := []struct {
		name      string
		inventory domain.CropInventory
		wantErr   bool
	}{
		{
			name: "valid arabica inventory",
			inventory: domain.CropInventory{
				LandID: "LHN-001", Variety: domain.VarietyArabica,
				AgeGroup: domain.AgeUnderFifteenYears,
			},
		},
		{
			name: "reject unsupported variety",
			inventory: domain.CropInventory{
				LandID: "LHN-001", Variety: "LIBERICA",
				AgeGroup: domain.AgeUnderFifteenYears,
			},
			wantErr: true,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateCropInventory(&test.inventory)
			if (err != nil) != test.wantErr {
				t.Fatalf("validateCropInventory() error = %v, wantErr %v", err, test.wantErr)
			}
			if test.wantErr && !errors.Is(err, domain.ErrInvalid) {
				t.Fatalf("error %v does not wrap ErrInvalid", err)
			}
		})
	}
}
