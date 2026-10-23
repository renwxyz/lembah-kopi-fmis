package handler

import (
	"context"
	"net/http"
	"time"

	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
)

type SoilConditionUseCases interface {
	ListByLand(context.Context, string, domain.SoilConditionFilter, int, int) (*domain.Page[domain.SoilConditionLog], error)
	Get(context.Context, string) (*domain.SoilConditionLog, error)
	Create(context.Context, *domain.SoilConditionLog) error
}

type SoilConditionHandler struct {
	useCases SoilConditionUseCases
}

type SoilConditionRequest struct {
	FertilizerID   *string                 `json:"id_pemupukan"`
	MonitoringStep *domain.TahapPemantauan `json:"tahap_pemantauan"`
	MeasuredAt     *time.Time              `json:"tanggal_ukur"`
	SoilPH         *float64                `json:"ph_tanah"`
	Moisture       *float64                `json:"kelembapan"`
	TemperatureC   *float64                `json:"suhu_celsius"`
	Nitrogen       *int                    `json:"n_value"`
	Phosphorus     *int                    `json:"p_value"`
	Potassium      *int                    `json:"k_value"`
	Conductivity   *int                    `json:"ec_value"`
}

func NewSoilConditionHandler(useCases SoilConditionUseCases) *SoilConditionHandler {
	return &SoilConditionHandler{useCases: useCases}
}

func (h *SoilConditionHandler) ListByLand(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	from, err := parseTimestampQuery(r, "dari")
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	to, err := parseTimestampQuery(r, "sampai")
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	filter := domain.SoilConditionFilter{
		FertilizerID:   r.URL.Query().Get("id_pemupukan"),
		MonitoringStep: r.URL.Query().Get("tahap_pemantauan"),
		From:           from, To: to,
	}
	result, err := h.useCases.ListByLand(r.Context(), chi.URLParam(r, "id"), filter, page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Histori kondisi tanah berhasil diambil", result)
}

func (h *SoilConditionHandler) Get(w http.ResponseWriter, r *http.Request) {
	item, err := h.useCases.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data pengukuran tanah berhasil diambil", item)
}

func (h *SoilConditionHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request SoilConditionRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	measuredAt := time.Now()
	if request.MeasuredAt != nil {
		measuredAt = *request.MeasuredAt
	}
	item := &domain.SoilConditionLog{
		LandID: chi.URLParam(r, "id"), FertilizerID: request.FertilizerID,
		MonitoringStep: request.MonitoringStep, MeasuredAt: measuredAt,
		SoilPH: request.SoilPH, Moisture: request.Moisture, TemperatureC: request.TemperatureC,
		Nitrogen: request.Nitrogen, Phosphorus: request.Phosphorus,
		Potassium: request.Potassium, Conductivity: request.Conductivity,
	}
	if err := h.useCases.Create(r.Context(), item); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Hasil sampling tanah berhasil dicatat", item)
}
