package domain

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestPopulationFieldsAreScopedToPopulationResponses(t *testing.T) {
	inventoryJSON, err := json.Marshal(CropInventory{ID: "INV-001", TreeCount: 1500})
	if err != nil {
		t.Fatalf("marshal crop inventory: %v", err)
	}
	if strings.Contains(string(inventoryJSON), "jumlah_pohon") {
		t.Fatalf("inventory response unexpectedly includes population: %s", inventoryJSON)
	}

	landJSON, err := json.Marshal(Land{ID: "LHN-001", TreeCount: 1500})
	if err != nil {
		t.Fatalf("marshal land: %v", err)
	}
	if strings.Contains(string(landJSON), "total_pohon") {
		t.Fatalf("land response unexpectedly includes population: %s", landJSON)
	}

	populationJSON, err := json.Marshal(TreePopulationSummary{
		LandID: "LHN-001", TotalTreeCount: 1500,
		Items: []TreePopulationItem{{InventoryID: "INV-001", TreeCount: 1500}},
	})
	if err != nil {
		t.Fatalf("marshal tree population: %v", err)
	}
	if !strings.Contains(string(populationJSON), "jumlah_pohon") || !strings.Contains(string(populationJSON), "total_pohon") {
		t.Fatalf("population response is missing count fields: %s", populationJSON)
	}
}
