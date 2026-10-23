package domain

import "context"

type TreePopulationItem struct {
	InventoryID string        `json:"id_inventaris"`
	Variety     CoffeeVariety `json:"varietas"`
	AgeGroup    PlantAgeGroup `json:"kelompok_usia"`
	TreeCount   int           `json:"jumlah_pohon"`
}

type TreePopulationSummary struct {
	LandID         string               `json:"id_lahan"`
	TotalTreeCount int                  `json:"total_pohon"`
	Items          []TreePopulationItem `json:"blok"`
}

type TreePopulationRepository interface {
	GetByLand(context.Context, string) (*TreePopulationSummary, error)
	SetForInventory(context.Context, string, int) (*TreePopulationItem, error)
}
