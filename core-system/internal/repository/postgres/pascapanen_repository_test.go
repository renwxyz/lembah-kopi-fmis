package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"testing"
	"time"

	"lembah-kopi/core-system/internal/domain"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func TestPascapanenRepositoryIntegration(t *testing.T) {
	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("TEST_DATABASE_URL is not set")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if err := db.PingContext(ctx); err != nil {
		t.Fatal(err)
	}

	suffix := fmt.Sprintf("%012x", uint64(time.Now().UnixNano())&0xffffffffffff)
	farmerID, landID, inventoryID := "TF"+suffix, "TL"+suffix, "TI"+suffix
	harvestID, batchID, soilID := "TH"+suffix, "TB"+suffix, "TS"+suffix
	mappingID, stageID := "TM"+suffix, "TE"+suffix
	cleanup := func() {
		if _, err := db.ExecContext(context.Background(), `DELETE FROM batch_pascaproses WHERE id_batch = $1`, batchID); err != nil {
			t.Errorf("cleanup batch: %v", err)
		}
		if _, err := db.ExecContext(context.Background(), `DELETE FROM riwayat_panen WHERE id_panen = $1`, harvestID); err != nil {
			t.Errorf("cleanup harvest: %v", err)
		}
		if _, err := db.ExecContext(context.Background(), `DELETE FROM log_kondisi_tanah WHERE id_log_tanah = $1`, soilID); err != nil {
			t.Errorf("cleanup soil log: %v", err)
		}
		if _, err := db.ExecContext(context.Background(), `DELETE FROM inventaris_tanaman WHERE id_inventaris = $1`, inventoryID); err != nil {
			t.Errorf("cleanup inventory: %v", err)
		}
		if _, err := db.ExecContext(context.Background(), `DELETE FROM lahan WHERE id_lahan = $1`, landID); err != nil {
			t.Errorf("cleanup land: %v", err)
		}
		if _, err := db.ExecContext(context.Background(), `DELETE FROM petani WHERE id_petani = $1`, farmerID); err != nil {
			t.Errorf("cleanup farmer: %v", err)
		}
	}
	defer cleanup()

	_, err = db.ExecContext(ctx, `INSERT INTO petani (id_petani, nama_lengkap, no_hp) VALUES ($1, 'Integration test', '0000000000')`, farmerID)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.ExecContext(ctx, `INSERT INTO lahan (id_lahan, id_petani, nama_petak, dusun) VALUES ($1, $2, 'Integration test', 'Test')`, landID, farmerID)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.ExecContext(ctx, `
		INSERT INTO inventaris_tanaman (id_inventaris, id_lahan, varietas, jumlah_pohon, kelompok_usia)
		VALUES ($1, $2, 'ROBUSTA', 25, 'LIMA_TAHUN_KURANG')`, inventoryID, landID)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.ExecContext(ctx, `
		INSERT INTO log_kondisi_tanah (id_log_tanah, id_lahan, tanggal_ukur, ph_tanah)
		VALUES ($1, $2, CURRENT_TIMESTAMP, 5.5)`, soilID, landID)
	if err != nil {
		t.Fatal(err)
	}

	harvestRepository := NewHarvestRepository(db)
	inventoryReference := inventoryID
	harvest := &domain.HarvestLog{
		ID: harvestID, LandID: landID, InventoryID: &inventoryReference,
		HarvestDate: time.Date(2026, time.January, 10, 0, 0, 0, 0, time.UTC), CherryWeightKG: 10,
		PickingMethod: domain.PickingRedCherry,
	}
	if err := harvestRepository.Create(ctx, harvest); err != nil {
		t.Fatalf("create harvest: %v", err)
	}
	if harvest.Variety != domain.VarietyRobusta || harvest.Allocation != domain.AllocationUnprocessed {
		t.Fatalf("unexpected harvest after create: %#v", harvest)
	}

	batchRepository := NewProcessingBatchRepository(db)
	startDate := time.Now().UTC()
	batch := &domain.ProcessingBatch{
		ID: batchID, QRTraceCode: "QR-" + suffix, MethodCode: "NATURAL",
		EstimatedStartDate: startDate, Status: domain.ProcessingFermentation,
	}
	if err := batchRepository.Create(ctx, batch); err != nil {
		t.Fatalf("create batch: %v", err)
	}
	mapping := &domain.BatchPanenMapping{
		ID: mappingID, BatchID: batchID, HarvestID: harvestID, UsedWeight: 4,
	}
	if err := batchRepository.AddMapping(ctx, mapping); err != nil {
		t.Fatalf("allocate harvest: %v", err)
	}
	storedBatch, err := batchRepository.Get(ctx, batchID)
	if err != nil || storedBatch.CherryInputKG != 4 {
		t.Fatalf("batch input = %v, error = %v; want 4", storedBatch, err)
	}
	storedHarvest, err := harvestRepository.Get(ctx, harvestID)
	if err != nil || storedHarvest.Allocation != domain.AllocationPartial {
		t.Fatalf("harvest allocation = %v, error = %v; want PARTIAL", storedHarvest, err)
	}

	overAllocation := &domain.BatchPanenMapping{
		ID: "TO" + suffix, BatchID: batchID, HarvestID: harvestID, UsedWeight: 7,
	}
	if err := batchRepository.AddMapping(ctx, overAllocation); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("oversubscription error = %v, want domain.ErrInvalid", err)
	}
	mapping.UsedWeight = 10
	if err := batchRepository.UpdateMapping(ctx, mapping); err != nil {
		t.Fatalf("update allocation: %v", err)
	}
	storedHarvest, err = harvestRepository.Get(ctx, harvestID)
	if err != nil || storedHarvest.Allocation != domain.AllocationFullyBatched {
		t.Fatalf("harvest allocation = %v, error = %v; want FULLY_BATCHED", storedHarvest, err)
	}
	date := time.Date(2026, time.January, 10, 0, 0, 0, 0, time.UTC)
	harvests, total, err := harvestRepository.ListByLand(ctx, landID, domain.HarvestFilter{
		From: &date, To: &date, Variety: string(domain.VarietyRobusta),
		Allocation: string(domain.AllocationFullyBatched),
	}, 20, 0)
	if err != nil || total != 1 || len(harvests) != 1 {
		t.Fatalf("filtered harvest list = %v, total = %d, error = %v", harvests, total, err)
	}
	mappings, mappingTotal, err := batchRepository.ListMappings(ctx, batchID, 20, 0)
	if err != nil || mappingTotal != 1 || len(mappings) != 1 || mappings[0].UsedWeight != 10 {
		t.Fatalf("batch mappings = %v, total = %d, error = %v", mappings, mappingTotal, err)
	}

	outputWeight := 3.5
	batch.GreenBeanOutputKG = &outputWeight
	if _, err := batchRepository.Update(ctx, batch); err != nil {
		t.Fatalf("record green bean output: %v", err)
	}
	stage := &domain.ProcessingStageRecord{
		ID: stageID, BatchID: batchID, Status: domain.ProcessingComplete,
		ChangedAt: time.Now().UTC(),
	}
	if err := batchRepository.AddStage(ctx, stage); err != nil {
		t.Fatalf("complete batch: %v", err)
	}
	stages, stageTotal, err := batchRepository.ListStages(ctx, batchID, 20, 0)
	if err != nil || stageTotal != 2 || len(stages) != 2 {
		t.Fatalf("batch stages = %v, total = %d, error = %v", stages, stageTotal, err)
	}
	storedBatch, err = batchRepository.Get(ctx, batchID)
	if err != nil || storedBatch.Status != domain.ProcessingComplete || storedBatch.YieldPercent == nil || *storedBatch.YieldPercent != 35 {
		t.Fatalf("completed batch = %v, error = %v; want SELESAI and 35%% yield", storedBatch, err)
	}

	traceability, err := batchRepository.GetTraceability(ctx, batchID)
	if err != nil {
		t.Fatalf("get traceability: %v", err)
	}
	if len(traceability.Origins) != 1 || traceability.Origins[0].Land.ID != landID ||
		traceability.Origins[0].Inventory == nil || traceability.Origins[0].Inventory.ID != inventoryID ||
		traceability.Origins[0].Inventory.TreeCount != 25 ||
		len(traceability.Origins[0].SoilHistory) != 1 {
		t.Fatalf("unexpected traceability: %#v", traceability)
	}

	reducedHarvest := *storedHarvest
	reducedHarvest.CherryWeightKG = 9
	if _, err := harvestRepository.Update(ctx, &reducedHarvest); !errors.Is(err, domain.ErrInvalid) {
		t.Fatalf("weight below allocated amount error = %v, want domain.ErrInvalid", err)
	}
}
