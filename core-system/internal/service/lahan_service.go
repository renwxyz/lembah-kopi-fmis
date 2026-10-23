package service

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"strings"
	"unicode/utf8"

	"lembah-kopi/core-system/internal/domain"
)

type LandService struct {
	repository domain.LandRepository
}

func NewLandService(repository domain.LandRepository) *LandService {
	return &LandService{repository: repository}
}

func (s *LandService) List(ctx context.Context, farmerID, search string, page, pageSize int) (*domain.Page[domain.Land], error) {
	page, pageSize, offset, err := pagination(page, pageSize)
	if err != nil {
		return nil, err
	}
	items, total, err := s.repository.List(ctx, farmerID, strings.TrimSpace(search), pageSize, offset)
	if err != nil {
		return nil, err
	}
	return &domain.Page[domain.Land]{Items: items, Total: total, Page: page, PageSize: pageSize}, nil
}

func (s *LandService) Get(ctx context.Context, id string) (*domain.Land, error) {
	return s.repository.Get(ctx, id)
}

func (s *LandService) Create(ctx context.Context, land *domain.Land) error {
	if err := validateLand(land); err != nil {
		return err
	}
	land.TreeCount = 0
	id, err := newIdentifier("LHN-")
	if err != nil {
		return err
	}
	land.ID = id
	return s.repository.Create(ctx, land)
}

func (s *LandService) Update(ctx context.Context, land *domain.Land) (*domain.Land, error) {
	if land.ID == "" {
		return nil, fmt.Errorf("%w: id_lahan wajib diisi", domain.ErrInvalid)
	}
	if err := validateLand(land); err != nil {
		return nil, err
	}
	return s.repository.Update(ctx, land)
}

func (s *LandService) Delete(ctx context.Context, id string) error {
	return s.repository.Delete(ctx, id)
}

func (s *LandService) SetPolygon(ctx context.Context, id, polygonGeoJSON string) (*domain.Land, error) {
	if id == "" || strings.TrimSpace(polygonGeoJSON) == "" {
		return nil, fmt.Errorf("%w: id_lahan dan polygon GeoJSON wajib diisi", domain.ErrInvalid)
	}
	if err := validatePolygonGeoJSON(polygonGeoJSON); err != nil {
		return nil, err
	}
	return s.repository.SetPolygon(ctx, id, polygonGeoJSON)
}

func (s *LandService) DeletePolygon(ctx context.Context, id string) error {
	return s.repository.DeletePolygon(ctx, id)
}

func validateLand(land *domain.Land) error {
	land.PlotName = strings.TrimSpace(land.PlotName)
	land.Hamlet = strings.TrimSpace(land.Hamlet)
	if land.FarmerID == "" || land.PlotName == "" || utf8.RuneCountInString(land.PlotName) > 50 ||
		land.Hamlet == "" || utf8.RuneCountInString(land.Hamlet) > 50 {
		return fmt.Errorf("%w: id_petani, nama_petak, dan dusun wajib valid", domain.ErrInvalid)
	}

	if land.ElevationM != nil && *land.ElevationM < 0 {
		return fmt.Errorf("%w: elevasi_mdpl tidak boleh negatif", domain.ErrInvalid)
	}
	if (land.Latitude == nil) != (land.Longitude == nil) {
		return fmt.Errorf("%w: latitude dan longitude harus diisi bersamaan", domain.ErrInvalid)
	}
	if land.Latitude != nil && (*land.Latitude < -90 || *land.Latitude > 90 || *land.Longitude < -180 || *land.Longitude > 180) {
		return fmt.Errorf("%w: koordinat berada di luar rentang", domain.ErrInvalid)
	}
	if land.TreeCount < 0 {
		return fmt.Errorf("%w: total_pohon tidak boleh negatif", domain.ErrInvalid)
	}
	return nil
}

func validatePolygonGeoJSON(encoded string) error {
	var polygon struct {
		Type        string        `json:"type"`
		Coordinates [][][]float64 `json:"coordinates"`
	}
	if err := json.Unmarshal([]byte(encoded), &polygon); err != nil {
		return fmt.Errorf("%w: polygon harus berupa GeoJSON yang valid: %v", domain.ErrInvalid, err)
	}
	if polygon.Type != "Polygon" || len(polygon.Coordinates) == 0 {
		return fmt.Errorf("%w: geometri harus berupa GeoJSON Polygon", domain.ErrInvalid)
	}
	for _, ring := range polygon.Coordinates {
		if len(ring) < 4 {
			return fmt.Errorf("%w: setiap ring polygon membutuhkan minimal empat koordinat", domain.ErrInvalid)
		}
		for _, coordinate := range ring {
			if len(coordinate) != 2 || math.IsNaN(coordinate[0]) || math.IsNaN(coordinate[1]) ||
				math.IsInf(coordinate[0], 0) || math.IsInf(coordinate[1], 0) ||
				coordinate[0] < -180 || coordinate[0] > 180 || coordinate[1] < -90 || coordinate[1] > 90 {
				return fmt.Errorf("%w: koordinat GeoJSON harus berupa [longitude, latitude] yang valid", domain.ErrInvalid)
			}
		}
		first, last := ring[0], ring[len(ring)-1]
		if first[0] != last[0] || first[1] != last[1] {
			return fmt.Errorf("%w: ring polygon harus tertutup", domain.ErrInvalid)
		}
	}
	return nil
}
