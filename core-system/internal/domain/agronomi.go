package domain

import (
	"context"
	"encoding/json"
	"time"
)

type TahapPemantauan string

const (
	TahapSebelum TahapPemantauan = "SEBELUM"
	TahapSesudah TahapPemantauan = "SESUDAH"
)

type TingkatSerangan string

const (
	TingkatRingan TingkatSerangan = "RINGAN"
	TingkatSedang TingkatSerangan = "SEDANG"
	TingkatBerat  TingkatSerangan = "BERAT"
)

type StatusPenanganan string

const (
	StatusTerdeteksi      StatusPenanganan = "TERDETEKSI"
	StatusDalamPenanganan StatusPenanganan = "DALAM_PENANGANAN"
	StatusTerkendali      StatusPenanganan = "TERKENDALI"
)

// English aliases for architectural consistency across domain packages.
type (
	MonitoringStage = TahapPemantauan
	AttackSeverity  = TingkatSerangan
	TreatmentStatus = StatusPenanganan
)

const (
	StageBefore MonitoringStage = TahapSebelum
	StageAfter  MonitoringStage = TahapSesudah

	SeverityMild     AttackSeverity = TingkatRingan
	SeverityModerate AttackSeverity = TingkatSedang
	SeveritySevere   AttackSeverity = TingkatBerat

	StatusDetected       TreatmentStatus = StatusTerdeteksi
	StatusUnderTreatment TreatmentStatus = StatusDalamPenanganan
	StatusControlled     TreatmentStatus = StatusTerkendali
)

type SoilConditionLog struct {
	ID             string           `json:"id_log_tanah"`
	LandID         string           `json:"id_lahan"`
	FertilizerID   *string          `json:"id_pemupukan,omitempty"`
	MonitoringStep *TahapPemantauan `json:"tahap_pemantauan,omitempty"`
	MeasuredAt     time.Time        `json:"tanggal_ukur"`
	SoilPH         *float64         `json:"ph_tanah"`
	Moisture       *float64         `json:"kelembapan"`
	TemperatureC   *float64         `json:"suhu_celsius"`
	Nitrogen       *int             `json:"n_value"`
	Phosphorus     *int             `json:"p_value"`
	Potassium      *int             `json:"k_value"`
	Conductivity   *int             `json:"ec_value"`
	CreatedAt      time.Time        `json:"created_at"`
}

type SoilConditionFilter struct {
	FertilizerID   string
	MonitoringStep string
	From           *time.Time
	To             *time.Time
}

type SoilConditionRepository interface {
	ListByLand(context.Context, string, SoilConditionFilter, int, int) ([]SoilConditionLog, int, error)
	Get(context.Context, string) (*SoilConditionLog, error)
	Create(context.Context, *SoilConditionLog) error
}

type Fertilization struct {
	ID         string    `json:"id_pemupukan"`
	LandID     string    `json:"id_lahan"`
	AppliedAt  time.Time `json:"tanggal_aplikasi"`
	Fertilizer string    `json:"jenis_pupuk"`
	DoseKG     float64   `json:"dosis_kg"`
	CreatedAt  time.Time `json:"created_at,omitempty"`
	UpdatedAt  time.Time `json:"updated_at,omitempty"`
}

func (item Fertilization) MarshalJSON() ([]byte, error) {
	type response struct {
		ID         string    `json:"id_pemupukan"`
		LandID     string    `json:"id_lahan"`
		AppliedAt  string    `json:"tanggal_aplikasi"`
		Fertilizer string    `json:"jenis_pupuk"`
		DoseKG     float64   `json:"dosis_kg"`
		CreatedAt  time.Time `json:"created_at,omitempty"`
		UpdatedAt  time.Time `json:"updated_at,omitempty"`
	}
	return json.Marshal(response{
		ID: item.ID, LandID: item.LandID, AppliedAt: item.AppliedAt.Format("2006-01-02"),
		Fertilizer: item.Fertilizer, DoseKG: item.DoseKG,
		CreatedAt: item.CreatedAt, UpdatedAt: item.UpdatedAt,
	})
}

type FertilizationRepository interface {
	ListByLand(context.Context, string, int, int) ([]Fertilization, int, error)
	Get(context.Context, string) (*Fertilization, error)
	Create(context.Context, *Fertilization) error
	Update(context.Context, *Fertilization) (*Fertilization, error)
	Delete(context.Context, string) error
}

type PestDiseaseIncident struct {
	ID              string           `json:"id_insiden"`
	LandID          string           `json:"id_lahan"`
	FoundAt         time.Time        `json:"tanggal_ditemukan"`
	PestDisease     string           `json:"jenis_hama_penyakit"`
	Severity        TingkatSerangan  `json:"tingkat_serangan"`
	CurrentStatus   StatusPenanganan `json:"status_penanganan"`
	LatestTreatment *TreatmentRecord `json:"penanganan_terakhir,omitempty"`
	CreatedAt       time.Time        `json:"created_at,omitempty"`
	UpdatedAt       time.Time        `json:"updated_at,omitempty"`
}

func (item PestDiseaseIncident) MarshalJSON() ([]byte, error) {
	type response struct {
		ID              string           `json:"id_insiden"`
		LandID          string           `json:"id_lahan"`
		FoundAt         string           `json:"tanggal_ditemukan"`
		PestDisease     string           `json:"jenis_hama_penyakit"`
		Severity        TingkatSerangan  `json:"tingkat_serangan"`
		CurrentStatus   StatusPenanganan `json:"status_penanganan"`
		LatestTreatment *TreatmentRecord `json:"penanganan_terakhir,omitempty"`
		CreatedAt       time.Time        `json:"created_at,omitempty"`
		UpdatedAt       time.Time        `json:"updated_at,omitempty"`
	}
	return json.Marshal(response{
		ID: item.ID, LandID: item.LandID, FoundAt: item.FoundAt.Format("2006-01-02"),
		PestDisease: item.PestDisease, Severity: item.Severity, CurrentStatus: item.CurrentStatus,
		LatestTreatment: item.LatestTreatment, CreatedAt: item.CreatedAt, UpdatedAt: item.UpdatedAt,
	})
}

type TreatmentRecord struct {
	ID         string           `json:"id_riwayat_penanganan"`
	IncidentID string           `json:"id_insiden"`
	TreatedAt  time.Time        `json:"tanggal_penanganan"`
	Action     *string          `json:"tindakan_penanganan"`
	Status     StatusPenanganan `json:"status_penanganan"`
	AdminID    *string          `json:"id_admin,omitempty"`
	CreatedAt  time.Time        `json:"created_at"`
}

type IncidentFilter struct {
	Status   string
	Severity string
	From     *time.Time
	To       *time.Time
}

type PestDiseaseRepository interface {
	ListByLand(context.Context, string, IncidentFilter, int, int) ([]PestDiseaseIncident, int, error)
	Get(context.Context, string) (*PestDiseaseIncident, error)
	Create(context.Context, *PestDiseaseIncident) error
	Update(context.Context, *PestDiseaseIncident) (*PestDiseaseIncident, error)
	Delete(context.Context, string) error
	ListTreatments(context.Context, string, int, int) ([]TreatmentRecord, int, error)
	AddTreatment(context.Context, *TreatmentRecord) error
}
