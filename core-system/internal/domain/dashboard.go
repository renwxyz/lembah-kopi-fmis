package domain

import (
	"context"
	"encoding/json"
	"time"
)

// DashboardOverview is the read model used by the operational dashboard.
// It deliberately contains presentation-ready joins to prevent client-side N+1 requests.
type DashboardOverview struct {
	Summary        DashboardSummary       `json:"summary"`
	MapLands       []DashboardMapLand     `json:"map_lahan"`
	ActiveBatches  []DashboardBatch       `json:"batch_aktif"`
	FarmAlerts     []DashboardFarmAlert   `json:"peringatan_kebun"`
	RecentHarvests []DashboardHarvest     `json:"panen_terbaru"`
}

type DashboardSummary struct {
	FarmerCount       int     `json:"total_petani"`
	LandAreaM2        float64 `json:"total_luas_m2"`
	CurrentMonthHarvestKG float64 `json:"panen_bulan_ini_kg"`
	ActiveBatchCount  int     `json:"total_batch_aktif"`
}

type DashboardMapLand struct {
	ID          string          `json:"id_lahan"`
	PlotName    string          `json:"nama_petak"`
	FarmerID    string          `json:"id_petani"`
	FarmerName  string          `json:"nama_petani"`
	Hamlet      string          `json:"dusun"`
	ElevationM  *int            `json:"elevasi_mdpl,omitempty"`
	AreaM2      *float64        `json:"luas_m2,omitempty"`
	TreeCount   int             `json:"total_pohon"`
	Polygon     json.RawMessage `json:"polygon_geom,omitempty"`
}

type DashboardBatch struct {
	ID                  string           `json:"id_batch"`
	QRTraceCode         string           `json:"kode_qr_trace"`
	MethodCode          string           `json:"metode_proses"`
	CherryInputKG       float64          `json:"total_input_ceri_kg"`
	Status              ProcessingStatus `json:"status_proses"`
	EstimatedCompletion *time.Time       `json:"estimasi_tanggal_selesai,omitempty"`
}

type DashboardFarmAlert struct {
	IncidentID    string           `json:"id_insiden"`
	LandID        string           `json:"id_lahan"`
	PlotName      string           `json:"nama_petak"`
	PestDisease   string           `json:"jenis_hama_penyakit"`
	Severity      TingkatSerangan  `json:"tingkat_serangan"`
	CurrentStatus StatusPenanganan `json:"status_penanganan"`
	FoundAt       time.Time        `json:"tanggal_ditemukan"`
}

type DashboardHarvest struct {
	ID             string           `json:"id_panen"`
	HarvestDate    time.Time        `json:"tanggal_panen"`
	FarmerName     string           `json:"nama_petani"`
	PlotName       string           `json:"nama_petak"`
	Variety        CoffeeVariety    `json:"varietas"`
	CherryWeightKG float64          `json:"berat_ceri_kg"`
	Allocation     AllocationStatus `json:"status_alokasi"`
}

type DashboardRepository interface {
	GetOverview(context.Context) (*DashboardOverview, error)
}
