package service

import (
	"errors"
	"testing"

	"lembah-kopi/core-system/internal/domain"
)

func TestValidatePolygonGeoJSON(t *testing.T) {
	tests := []struct {
		name    string
		geoJSON string
		wantErr bool
	}{
		{
			name:    "closed polygon with longitude latitude coordinates",
			geoJSON: `{"type":"Polygon","coordinates":[[[110,-7],[110.001,-7],[110.001,-7.001],[110,-7.001],[110,-7]]]}`,
		},
		{
			name:    "reject non-polygon geometry",
			geoJSON: `{"type":"Point","coordinates":[110,-7]}`,
			wantErr: true,
		},
		{
			name:    "reject open ring",
			geoJSON: `{"type":"Polygon","coordinates":[[[110,-7],[110.001,-7],[110.001,-7.001],[110,-7.001]]]}`,
			wantErr: true,
		},
		{
			name:    "reject out of range latitude",
			geoJSON: `{"type":"Polygon","coordinates":[[[110,-91],[110.001,-7],[110.001,-7.001],[110,-7.001],[110,-91]]]}`,
			wantErr: true,
		},
		{
			name:    "reject malformed coordinates",
			geoJSON: `{"type":"Polygon","coordinates":[[[110,-7],[110.001,-7],[110,-7]]]}`,
			wantErr: true,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validatePolygonGeoJSON(test.geoJSON)
			if (err != nil) != test.wantErr {
				t.Fatalf("validatePolygonGeoJSON() error = %v, wantErr %v", err, test.wantErr)
			}
			if test.wantErr && !errors.Is(err, domain.ErrInvalid) {
				t.Fatalf("error %v does not wrap ErrInvalid", err)
			}
		})
	}
}

func TestValidateLandCoordinatesMustBePaired(t *testing.T) {
	latitude := -7.33
	land := &domain.Land{
		FarmerID: "PTN-001", PlotName: "Petak", Hamlet: "Glodogan",
		Latitude: &latitude,
	}
	if err := validateLand(land); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("validateLand() error = %v, want ErrInvalid", err)
	}
}
