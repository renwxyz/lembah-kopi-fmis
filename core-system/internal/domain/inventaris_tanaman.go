package domain

import (
	"context"
	"time"
)

type CoffeeVariety string

const (
	VarietyRobusta CoffeeVariety = "ROBUSTA"
	VarietyArabica CoffeeVariety = "ARABIKA"
)

type PlantAgeGroup string

const (
	AgeUnderFiveYears      PlantAgeGroup = "LIMA_TAHUN_KURANG"
	AgeUnderFifteenYears   PlantAgeGroup = "LIMA_BELAS_TAHUN_KURANG"
	AgeAtLeastFifteenYears PlantAgeGroup = "LIMA_BELAS_TAHUN_LEBIH"
)

type CropInventory struct {
	ID        string        `json:"id_inventaris"`
	LandID    string        `json:"id_lahan"`
	Variety   CoffeeVariety `json:"varietas"`
	TreeCount int           `json:"-"`
	AgeGroup  PlantAgeGroup `json:"kelompok_usia"`
	CreatedAt time.Time     `json:"created_at,omitempty"`
	UpdatedAt time.Time     `json:"updated_at,omitempty"`
}

type CropInventoryRepository interface {
	ListByLand(context.Context, string) ([]CropInventory, error)
	Get(context.Context, string) (*CropInventory, error)
	Create(context.Context, *CropInventory) error
	Update(context.Context, *CropInventory) (*CropInventory, error)
	Delete(context.Context, string) error
}
