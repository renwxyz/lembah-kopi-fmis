package service

import (
	"errors"
	"testing"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

func TestValidateHarvestFields(t *testing.T) {
	tests := []struct {
		name    string
		item    domain.HarvestLog
		wantErr bool
	}{
		{
			name: "valid harvest",
			item: domain.HarvestLog{
				CherryWeightKG: 12.25,
				PickingMethod:  domain.PickingRedCherry,
			},
		},
		{
			name: "zero weight",
			item: domain.HarvestLog{
				CherryWeightKG: 0,
				PickingMethod:  domain.PickingRedCherry,
			},
			wantErr: true,
		},
		{
			name: "unknown picking method",
			item: domain.HarvestLog{
				CherryWeightKG: 1,
				PickingMethod:  "UNKNOWN",
			},
			wantErr: true,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateHarvestFields(&test.item)
			if (err != nil) != test.wantErr {
				t.Fatalf("validateHarvestFields() error = %v, wantErr %v", err, test.wantErr)
			}
			if test.wantErr && !errors.Is(err, domain.ErrInvalid) {
				t.Fatalf("error = %v, want domain.ErrInvalid", err)
			}
		})
	}
}

func TestNormalizeProcessingMethod(t *testing.T) {
	description := "  fermentasi tertutup  "
	item := domain.ProcessingMethod{
		Code: " anaerobic_01 ", Name: "  Anaerobic  ", Description: &description,
	}
	if err := normalizeProcessingMethod(&item); err != nil {
		t.Fatalf("normalizeProcessingMethod() error = %v", err)
	}
	if item.Code != "ANAEROBIC_01" || item.Name != "Anaerobic" || *item.Description != "fermentasi tertutup" {
		t.Fatalf("method was not normalized: %#v", item)
	}

	item.Code = "1INVALID"
	if err := normalizeProcessingMethod(&item); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("invalid code error = %v, want domain.ErrInvalid", err)
	}
}

func TestValidateBatchTargets(t *testing.T) {
	start := time.Date(2026, time.January, 10, 0, 0, 0, 0, time.UTC)
	earlier := start.AddDate(0, 0, -1)
	item := domain.ProcessingBatch{EstimatedStartDate: start, EstimatedCompletion: &earlier}
	if err := validateBatchTargets(&item); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("earlier estimated completion error = %v, want domain.ErrInvalid", err)
	}

	target := 100.01
	item.EstimatedCompletion = nil
	item.TargetMoisturePercent = &target
	if err := validateBatchTargets(&item); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("out-of-range moisture error = %v, want domain.ErrInvalid", err)
	}
}
