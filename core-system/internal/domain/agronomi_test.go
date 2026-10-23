package domain

import (
	"encoding/json"
	"strings"
	"testing"
	"time"
)

func TestAgronomyDateFieldsSerializeAsISODate(t *testing.T) {
	date := time.Date(2026, time.October, 22, 0, 0, 0, 0, time.UTC)
	tests := []struct {
		name string
		item any
		want string
	}{
		{
			name: "fertilization",
			item: Fertilization{AppliedAt: date},
			want: `"tanggal_aplikasi":"2026-10-22"`,
		},
		{
			name: "incident",
			item: PestDiseaseIncident{FoundAt: date},
			want: `"tanggal_ditemukan":"2026-10-22"`,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			encoded, err := json.Marshal(test.item)
			if err != nil {
				t.Fatalf("marshal response: %v", err)
			}
			if !strings.Contains(string(encoded), test.want) {
				t.Fatalf("JSON %s does not contain %s", encoded, test.want)
			}
		})
	}
}
