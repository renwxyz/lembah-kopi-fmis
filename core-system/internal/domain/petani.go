package domain

import (
	"context"
	"time"
)

type Farmer struct {
	ID          string    `json:"id_petani"`
	FullName    string    `json:"nama_lengkap"`
	PhoneNumber string    `json:"no_hp"`
	CreatedAt   time.Time `json:"created_at,omitempty"`
	UpdatedAt   time.Time `json:"updated_at,omitempty"`
}

type FarmerRepository interface {
	List(context.Context, string, int, int) ([]Farmer, int, error)
	Get(context.Context, string) (*Farmer, error)
	Create(context.Context, *Farmer) error
	Update(context.Context, *Farmer) (*Farmer, error)
	Delete(context.Context, string) error
}
