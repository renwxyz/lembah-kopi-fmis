package service

import (
	"context"
	"errors"
	"testing"

	"lembah-kopi/core-system/internal/domain"
)

type treePopulationRepositoryStub struct {
	called bool
	item   domain.TreePopulationItem
}

func (r *treePopulationRepositoryStub) GetByLand(context.Context, string) (*domain.TreePopulationSummary, error) {
	r.called = true
	return &domain.TreePopulationSummary{}, nil
}

func (r *treePopulationRepositoryStub) SetForInventory(_ context.Context, inventoryID string, treeCount int) (*domain.TreePopulationItem, error) {
	r.called = true
	r.item = domain.TreePopulationItem{InventoryID: inventoryID, TreeCount: treeCount}
	return &r.item, nil
}

func TestTreePopulationServiceRejectsInvalidCounts(t *testing.T) {
	repository := &treePopulationRepositoryStub{}
	service := NewTreePopulationService(repository)

	_, err := service.SetForInventory(context.Background(), "INV-001", -1)
	if !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("SetForInventory() error = %v, want ErrInvalid", err)
	}
	if repository.called {
		t.Fatal("repository called for invalid population")
	}
}

func TestTreePopulationServiceUpdatesBlockCount(t *testing.T) {
	repository := &treePopulationRepositoryStub{}
	service := NewTreePopulationService(repository)

	item, err := service.SetForInventory(context.Background(), "INV-001", 1500)
	if err != nil {
		t.Fatalf("SetForInventory() error = %v", err)
	}
	if item.InventoryID != "INV-001" || item.TreeCount != 1500 {
		t.Fatalf("SetForInventory() item = %#v, want inventory INV-001 with 1500 trees", item)
	}
}
