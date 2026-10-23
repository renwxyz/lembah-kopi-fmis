package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"strings"

	"lembah-kopi/core-system/internal/domain"
)

type dashboardRepository struct {
	db *sql.DB
}

func NewDashboardRepository(db *sql.DB) domain.DashboardRepository {
	return &dashboardRepository{db: db}
}

func (r *dashboardRepository) GetOverview(ctx context.Context) (*domain.DashboardOverview, error) {
	overview := &domain.DashboardOverview{
		MapLands:       make([]domain.DashboardMapLand, 0),
		ActiveBatches:  make([]domain.DashboardBatch, 0),
		FarmAlerts:     make([]domain.DashboardFarmAlert, 0),
		RecentHarvests: make([]domain.DashboardHarvest, 0),
	}

	if err := r.db.QueryRowContext(ctx, `
		SELECT
			(SELECT COUNT(*) FROM petani),
			COALESCE((SELECT SUM(luas_m2) FROM lahan), 0),
			COALESCE((SELECT SUM(berat_ceri_kg) FROM riwayat_panen
				WHERE tanggal_panen >= date_trunc('month', CURRENT_DATE)::date
				AND tanggal_panen < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date), 0),
			(SELECT COUNT(*) FROM batch_pascaproses WHERE status_proses <> 'SELESAI')
	`).Scan(
		&overview.Summary.FarmerCount,
		&overview.Summary.LandAreaM2,
		&overview.Summary.CurrentMonthHarvestKG,
		&overview.Summary.ActiveBatchCount,
	); err != nil {
		return nil, translateDatabaseError(err)
	}

	landRows, err := r.db.QueryContext(ctx, `
		SELECT l.id_lahan, l.nama_petak, l.id_petani, p.nama_lengkap, l.dusun,
			l.elevasi_mdpl, l.luas_m2, l.total_pohon, ST_AsGeoJSON(l.polygon_geom)
		FROM lahan l
		JOIN petani p ON p.id_petani = l.id_petani
		ORDER BY l.nama_petak, l.id_lahan`)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer landRows.Close()
	for landRows.Next() {
		var item domain.DashboardMapLand
		var polygon sql.NullString
		if err := landRows.Scan(
			&item.ID, &item.PlotName, &item.FarmerID, &item.FarmerName, &item.Hamlet,
			&item.ElevationM, &item.AreaM2, &item.TreeCount, &polygon,
		); err != nil {
			return nil, translateDatabaseError(err)
		}
		if polygon.Valid && strings.TrimSpace(polygon.String) != "" {
			item.Polygon = json.RawMessage(polygon.String)
		}
		overview.MapLands = append(overview.MapLands, item)
	}
	if err := landRows.Err(); err != nil {
		return nil, translateDatabaseError(err)
	}

	batchRows, err := r.db.QueryContext(ctx, `
		SELECT id_batch, kode_qr_trace, metode_proses, total_input_ceri_kg,
			status_proses, estimasi_tanggal_selesai
		FROM batch_pascaproses
		WHERE status_proses <> 'SELESAI'
		ORDER BY tanggal_mulai_olah DESC, id_batch DESC
		LIMIT 5`)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer batchRows.Close()
	for batchRows.Next() {
		var item domain.DashboardBatch
		if err := batchRows.Scan(
			&item.ID, &item.QRTraceCode, &item.MethodCode, &item.CherryInputKG,
			&item.Status, &item.EstimatedCompletion,
		); err != nil {
			return nil, translateDatabaseError(err)
		}
		overview.ActiveBatches = append(overview.ActiveBatches, item)
	}
	if err := batchRows.Err(); err != nil {
		return nil, translateDatabaseError(err)
	}

	alertRows, err := r.db.QueryContext(ctx, `
		SELECT i.id_insiden, i.id_lahan, l.nama_petak, i.jenis_hama_penyakit,
			i.tingkat_serangan, latest.status_penanganan, i.tanggal_ditemukan
		FROM riwayat_hama_penyakit i
		JOIN lahan l ON l.id_lahan = i.id_lahan
		JOIN LATERAL (
			SELECT status_penanganan
			FROM riwayat_penanganan_hama_penyakit
			WHERE id_insiden = i.id_insiden
			ORDER BY tanggal_penanganan DESC, id_riwayat_penanganan DESC
			LIMIT 1
		) latest ON TRUE
		WHERE latest.status_penanganan <> 'TERKENDALI'
		ORDER BY i.tanggal_ditemukan DESC, i.id_insiden DESC
		LIMIT 5`)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer alertRows.Close()
	for alertRows.Next() {
		var item domain.DashboardFarmAlert
		if err := alertRows.Scan(
			&item.IncidentID, &item.LandID, &item.PlotName, &item.PestDisease,
			&item.Severity, &item.CurrentStatus, &item.FoundAt,
		); err != nil {
			return nil, translateDatabaseError(err)
		}
		overview.FarmAlerts = append(overview.FarmAlerts, item)
	}
	if err := alertRows.Err(); err != nil {
		return nil, translateDatabaseError(err)
	}

	harvestRows, err := r.db.QueryContext(ctx, `
		SELECT h.id_panen, h.tanggal_panen, p.nama_lengkap, l.nama_petak,
			h.varietas, h.berat_ceri_kg, h.status_alokasi
		FROM riwayat_panen h
		JOIN lahan l ON l.id_lahan = h.id_lahan
		JOIN petani p ON p.id_petani = l.id_petani
		ORDER BY h.tanggal_panen DESC, h.id_panen DESC
		LIMIT 5`)
	if err != nil {
		return nil, translateDatabaseError(err)
	}
	defer harvestRows.Close()
	for harvestRows.Next() {
		var item domain.DashboardHarvest
		if err := harvestRows.Scan(
			&item.ID, &item.HarvestDate, &item.FarmerName, &item.PlotName,
			&item.Variety, &item.CherryWeightKG, &item.Allocation,
		); err != nil {
			return nil, translateDatabaseError(err)
		}
		overview.RecentHarvests = append(overview.RecentHarvests, item)
	}
	if err := harvestRows.Err(); err != nil {
		return nil, translateDatabaseError(err)
	}

	return overview, nil
}
