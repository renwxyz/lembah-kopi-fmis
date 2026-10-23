package service

import (
	"errors"
	"strings"
	"testing"
	"time"

	"lembah-kopi/core-system/internal/domain"
)

func TestValidateSoilMeasurementMatchesSchemaLimits(t *testing.T) {
	fertilizerID := "PUP-001"
	step := domain.TahapSebelum
	negative := -1
	tests := []struct {
		name    string
		item    domain.SoilConditionLog
		wantErr bool
	}{
		{name: "nullable parameters are allowed", item: domain.SoilConditionLog{}},
		{name: "valid monitoring reference", item: domain.SoilConditionLog{FertilizerID: &fertilizerID, MonitoringStep: &step}},
		{name: "pH outside range", item: domain.SoilConditionLog{SoilPH: floatPointer(14.1)}, wantErr: true},
		{name: "pH exceeds scale", item: domain.SoilConditionLog{SoilPH: floatPointer(5.55)}, wantErr: true},
		{name: "moisture outside range", item: domain.SoilConditionLog{Moisture: floatPointer(100.1)}, wantErr: true},
		{name: "negative nutrient", item: domain.SoilConditionLog{Nitrogen: &negative}, wantErr: true},
		{name: "missing monitoring stage", item: domain.SoilConditionLog{FertilizerID: &fertilizerID}, wantErr: true},
		{name: "invalid monitoring stage", item: domain.SoilConditionLog{FertilizerID: &fertilizerID, MonitoringStep: tahapPointer("SEKITAR")}, wantErr: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateSoilMeasurement(&test.item)
			if (err != nil) != test.wantErr {
				t.Fatalf("validateSoilMeasurement() error = %v, wantErr %v", err, test.wantErr)
			}
			if test.wantErr && !errors.Is(err, domain.ErrInvalid) {
				t.Fatalf("error %v does not wrap ErrInvalid", err)
			}
		})
	}
}

func TestValidateFertilizationMatchesSchemaLimits(t *testing.T) {
	valid := domain.Fertilization{
		LandID: "LHN-001", AppliedAt: time.Now().AddDate(0, 0, -1),
		Fertilizer: "NPK 16-16-16", DoseKG: 12.25,
	}
	tests := []struct {
		name    string
		item    domain.Fertilization
		wantErr bool
	}{
		{name: "valid application", item: valid},
		{name: "name too long", item: domain.Fertilization{LandID: "LHN-001", AppliedAt: valid.AppliedAt, Fertilizer: strings.Repeat("x", 101)}, wantErr: true},
		{name: "negative dose", item: domain.Fertilization{LandID: "LHN-001", AppliedAt: valid.AppliedAt, Fertilizer: "NPK", DoseKG: -1}, wantErr: true},
		{name: "dose exceeds precision", item: domain.Fertilization{LandID: "LHN-001", AppliedAt: valid.AppliedAt, Fertilizer: "NPK", DoseKG: 1000000}, wantErr: true},
		{name: "dose exceeds scale", item: domain.Fertilization{LandID: "LHN-001", AppliedAt: valid.AppliedAt, Fertilizer: "NPK", DoseKG: 1.234}, wantErr: true},
		{name: "future application is not an actual event", item: domain.Fertilization{LandID: "LHN-001", AppliedAt: time.Now().AddDate(0, 0, 1), Fertilizer: "NPK"}, wantErr: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateFertilization(&test.item)
			if (err != nil) != test.wantErr {
				t.Fatalf("validateFertilization() error = %v, wantErr %v", err, test.wantErr)
			}
			if test.wantErr && !errors.Is(err, domain.ErrInvalid) {
				t.Fatalf("error %v does not wrap ErrInvalid", err)
			}
		})
	}
}

func TestIncidentAndTreatmentEnumsAreValidated(t *testing.T) {
	if err := validateSeverity(domain.TingkatBerat); err != nil {
		t.Fatalf("valid severity rejected: %v", err)
	}
	if err := validateSeverity("KRITIS"); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("invalid severity error = %v, want ErrInvalid", err)
	}
	if err := validateTreatmentStatus(domain.StatusTerkendali); err != nil {
		t.Fatalf("valid treatment status rejected: %v", err)
	}
	if err := validateTreatmentStatus("SELESAI"); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("invalid treatment status error = %v, want ErrInvalid", err)
	}
}

func TestSoilFilterRequiresFertilizationWhenFilteringStage(t *testing.T) {
	filter := domain.SoilConditionFilter{MonitoringStep: string(domain.TahapSebelum)}
	if err := validateSoilFilter(filter); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("filter validation error = %v, want ErrInvalid", err)
	}
}

func floatPointer(value float64) *float64 {
	return &value
}

func tahapPointer(value string) *domain.TahapPemantauan {
	step := domain.TahapPemantauan(value)
	return &step
}
