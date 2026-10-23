package domain

import (
	"context"
	"encoding/json"
	"time"
)

type Land struct {
	ID         string          `json:"id_lahan"`
	FarmerID   string          `json:"id_petani"`
	PlotName   string          `json:"nama_petak"`
	Hamlet     string          `json:"dusun"`
	ElevationM *int            `json:"elevasi_mdpl,omitempty"`
	Latitude   *float64        `json:"latitude,omitempty"`
	Longitude  *float64        `json:"longitude,omitempty"`
	Polygon    json.RawMessage `json:"polygon_geom,omitempty"`
	AreaM2     *float64        `json:"luas_m2,omitempty"`
	TreeCount  int             `json:"-"`
	CreatedAt  time.Time       `json:"created_at,omitempty"`
	UpdatedAt  time.Time       `json:"updated_at,omitempty"`
}

type LandRepository interface {
	List(context.Context, string, string, int, int) ([]Land, int, error)
	Get(context.Context, string) (*Land, error)
	Create(context.Context, *Land) error
	Update(context.Context, *Land) (*Land, error)
	Delete(context.Context, string) error
	SetPolygon(context.Context, string, string) (*Land, error)
	DeletePolygon(context.Context, string) error
}
