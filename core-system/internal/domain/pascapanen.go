package domain

import (
	"context"
	"encoding/json"
	"time"
)

type HarvestLog struct {
	ID             string           `json:"id_panen"`
	LandID         string           `json:"id_lahan"`
	InventoryID    *string          `json:"id_inventaris"`
	HarvestDate    time.Time        `json:"tanggal_panen"`
	CherryWeightKG float64          `json:"berat_ceri_kg"`
	PickingMethod  PickingMethod    `json:"metode_petik"`
	Variety        CoffeeVariety    `json:"varietas"`
	Allocation     AllocationStatus `json:"status_alokasi"`
	CreatedAt      time.Time        `json:"created_at,omitempty"`
	UpdatedAt      time.Time        `json:"updated_at,omitempty"`
}

func (item HarvestLog) MarshalJSON() ([]byte, error) {
	type response struct {
		ID             string           `json:"id_panen"`
		LandID         string           `json:"id_lahan"`
		InventoryID    *string          `json:"id_inventaris"`
		HarvestDate    string           `json:"tanggal_panen"`
		CherryWeightKG float64          `json:"berat_ceri_kg"`
		PickingMethod  PickingMethod    `json:"metode_petik"`
		Variety        CoffeeVariety    `json:"varietas"`
		Allocation     AllocationStatus `json:"status_alokasi"`
		CreatedAt      time.Time        `json:"created_at,omitempty"`
		UpdatedAt      time.Time        `json:"updated_at,omitempty"`
	}
	return json.Marshal(response{
		ID: item.ID, LandID: item.LandID, InventoryID: item.InventoryID,
		HarvestDate: item.HarvestDate.Format("2006-01-02"), CherryWeightKG: item.CherryWeightKG,
		PickingMethod: item.PickingMethod, Variety: item.Variety, Allocation: item.Allocation,
		CreatedAt: item.CreatedAt, UpdatedAt: item.UpdatedAt,
	})
}

type PickingMethod string

const (
	PickingRedCherry PickingMethod = "PETIK_MERAH"
	PickingMixed     PickingMethod = "PETIK_PELANGI"
)

type AllocationStatus string

const (
	AllocationUnprocessed  AllocationStatus = "UNPROCESSED"
	AllocationPartial      AllocationStatus = "PARTIAL"
	AllocationFullyBatched AllocationStatus = "FULLY_BATCHED"
)

type ProcessingStatus string

const (
	ProcessingFermentation ProcessingStatus = "FERMENTASI"
	ProcessingDrying       ProcessingStatus = "PENGERINGAN"
	ProcessingHulling      ProcessingStatus = "HULLING_RESTING"
	ProcessingComplete     ProcessingStatus = "SELESAI"
)

type ProcessingMethod struct {
	Code        string    `json:"kode_metode"`
	Name        string    `json:"nama_metode"`
	Description *string   `json:"deskripsi,omitempty"`
	Active      bool      `json:"aktif"`
	CreatedAt   time.Time `json:"created_at,omitempty"`
	UpdatedAt   time.Time `json:"updated_at,omitempty"`
}

type ProcessingBatch struct {
	ID                    string           `json:"id_batch"`
	QRTraceCode           string           `json:"kode_qr_trace"`
	MethodCode            string           `json:"metode_proses"`
	EstimatedStartDate    time.Time        `json:"tanggal_mulai_olah"`
	EstimatedCompletion   *time.Time       `json:"estimasi_tanggal_selesai,omitempty"`
	ActualCompletion      *time.Time       `json:"tanggal_selesai_olah,omitempty"`
	TargetMoisturePercent *float64         `json:"target_kadar_air_persen,omitempty"`
	CherryInputKG         float64          `json:"total_input_ceri_kg"`
	GreenBeanOutputKG     *float64         `json:"berat_green_bean_kg,omitempty"`
	YieldPercent          *float64         `json:"rendemen_persen,omitempty"`
	Status                ProcessingStatus `json:"status_proses"`
	CreatedAt             time.Time        `json:"created_at,omitempty"`
	UpdatedAt             time.Time        `json:"updated_at,omitempty"`
}

func (item ProcessingBatch) MarshalJSON() ([]byte, error) {
	type response struct {
		ID                    string           `json:"id_batch"`
		QRTraceCode           string           `json:"kode_qr_trace"`
		MethodCode            string           `json:"metode_proses"`
		EstimatedStartDate    string           `json:"tanggal_mulai_olah"`
		EstimatedCompletion   *string          `json:"estimasi_tanggal_selesai,omitempty"`
		ActualCompletion      *string          `json:"tanggal_selesai_olah,omitempty"`
		TargetMoisturePercent *float64         `json:"target_kadar_air_persen,omitempty"`
		CherryInputKG         float64          `json:"total_input_ceri_kg"`
		GreenBeanOutputKG     *float64         `json:"berat_green_bean_kg,omitempty"`
		YieldPercent          *float64         `json:"rendemen_persen,omitempty"`
		Status                ProcessingStatus `json:"status_proses"`
		CreatedAt             time.Time        `json:"created_at,omitempty"`
		UpdatedAt             time.Time        `json:"updated_at,omitempty"`
	}
	var estimated, actual *string
	if item.EstimatedCompletion != nil {
		value := item.EstimatedCompletion.Format("2006-01-02")
		estimated = &value
	}
	if item.ActualCompletion != nil {
		value := item.ActualCompletion.Format("2006-01-02")
		actual = &value
	}
	return json.Marshal(response{
		ID: item.ID, QRTraceCode: item.QRTraceCode, MethodCode: item.MethodCode,
		EstimatedStartDate:  item.EstimatedStartDate.Format("2006-01-02"),
		EstimatedCompletion: estimated, ActualCompletion: actual,
		TargetMoisturePercent: item.TargetMoisturePercent,
		CherryInputKG:         item.CherryInputKG, GreenBeanOutputKG: item.GreenBeanOutputKG,
		YieldPercent: item.YieldPercent, Status: item.Status,
		CreatedAt: item.CreatedAt, UpdatedAt: item.UpdatedAt,
	})
}

type ProcessingStageRecord struct {
	ID              string           `json:"id_riwayat_tahap"`
	BatchID         string           `json:"id_batch"`
	Status          ProcessingStatus `json:"status_proses"`
	ChangedAt       time.Time        `json:"tanggal_perubahan"`
	MoisturePercent *float64         `json:"kadar_air_persen,omitempty"`
	Note            *string          `json:"catatan,omitempty"`
	AdminID         *string          `json:"id_admin,omitempty"`
	CreatedAt       time.Time        `json:"created_at"`
}

type BatchPanenMapping struct {
	ID         string    `json:"id_mapping"`
	BatchID    string    `json:"id_batch"`
	HarvestID  string    `json:"id_panen"`
	UsedWeight float64   `json:"berat_digunakan_kg"`
	CreatedAt  time.Time `json:"created_at,omitempty"`
}

type HarvestFilter struct {
	From       *time.Time
	To         *time.Time
	Variety    string
	Allocation string
}

type BatchFilter struct {
	Status     string
	MethodCode string
}

type BatchTraceOrigin struct {
	Mapping     BatchPanenMapping  `json:"alokasi"`
	Harvest     HarvestLog         `json:"panen"`
	Land        Land               `json:"lahan"`
	Farmer      Farmer             `json:"petani"`
	Inventory   *TraceInventory    `json:"inventaris,omitempty"`
	SoilHistory []SoilConditionLog `json:"histori_kondisi_tanah"`
}

type TraceInventory struct {
	ID        string        `json:"id_inventaris"`
	LandID    string        `json:"id_lahan"`
	Variety   CoffeeVariety `json:"varietas"`
	TreeCount int           `json:"jumlah_pohon"`
	AgeGroup  PlantAgeGroup `json:"kelompok_usia"`
}

type BatchTraceability struct {
	Batch   ProcessingBatch    `json:"batch"`
	Origins []BatchTraceOrigin `json:"asal_panen"`
}

type HarvestRepository interface {
	ListByLand(context.Context, string, HarvestFilter, int, int) ([]HarvestLog, int, error)
	Get(context.Context, string) (*HarvestLog, error)
	Create(context.Context, *HarvestLog) error
	Update(context.Context, *HarvestLog) (*HarvestLog, error)
	Delete(context.Context, string) error
}

type ProcessingMethodRepository interface {
	List(context.Context, bool) ([]ProcessingMethod, error)
	Get(context.Context, string) (*ProcessingMethod, error)
	Create(context.Context, *ProcessingMethod) error
	Update(context.Context, *ProcessingMethod) (*ProcessingMethod, error)
	Delete(context.Context, string) error
}

type ProcessingBatchRepository interface {
	List(context.Context, BatchFilter, int, int) ([]ProcessingBatch, int, error)
	Get(context.Context, string) (*ProcessingBatch, error)
	Create(context.Context, *ProcessingBatch) error
	Update(context.Context, *ProcessingBatch) (*ProcessingBatch, error)
	Delete(context.Context, string) error
	ListStages(context.Context, string, int, int) ([]ProcessingStageRecord, int, error)
	AddStage(context.Context, *ProcessingStageRecord) error
	ListMappings(context.Context, string, int, int) ([]BatchPanenMapping, int, error)
	AddMapping(context.Context, *BatchPanenMapping) error
	UpdateMapping(context.Context, *BatchPanenMapping) error
	DeleteMapping(context.Context, string, string) error
	GetTraceability(context.Context, string) (*BatchTraceability, error)
}
