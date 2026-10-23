package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
)

type LandUseCases interface {
	List(ctx context.Context, farmerID, search string, page, pageSize int) (*domain.Page[domain.Land], error)
	Get(ctx context.Context, id string) (*domain.Land, error)
	Create(ctx context.Context, land *domain.Land) error
	Update(ctx context.Context, land *domain.Land) (*domain.Land, error)
	Delete(ctx context.Context, id string) error
	SetPolygon(ctx context.Context, id, polygonGeoJSON string) (*domain.Land, error)
	DeletePolygon(ctx context.Context, id string) error
}

type LandHandler struct {
	useCases LandUseCases
}

type LandRequest struct {
	FarmerID  string   `json:"id_petani"`
	PlotName  string   `json:"nama_petak"`
	Hamlet    string   `json:"dusun"`
	Elevation *int     `json:"elevasi_mdpl"`
	Latitude  *float64 `json:"latitude"`
	Longitude *float64 `json:"longitude"`
}

type PolygonRequest struct {
	Polygon PolygonGeoJSON `json:"polygon_geom"`
}

type PolygonGeoJSON struct {
	Type        string        `json:"type"`
	Coordinates [][][]float64 `json:"coordinates"`
}

func NewLandHandler(useCases LandUseCases) *LandHandler {
	return &LandHandler{useCases: useCases}
}

// List godoc
func (h *LandHandler) List(w http.ResponseWriter, r *http.Request) {
	page, size, err := queryPagination(r)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	farmerID := r.URL.Query().Get("id_petani")
	if farmerID == "" {
		farmerID = r.URL.Query().Get("farmer_id")
	}
	result, err := h.useCases.List(r.Context(), farmerID, r.URL.Query().Get("search"), page, size)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Daftar lahan berhasil diambil", result)
}

// Get godoc
func (h *LandHandler) Get(w http.ResponseWriter, r *http.Request) {
	land, err := h.useCases.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data lahan berhasil diambil", land)
}

// Create godoc
func (h *LandHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request LandRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	land := landFromRequest(request, "")
	if err := h.useCases.Create(r.Context(), land); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusCreated, "Lahan berhasil didaftarkan", land)
}

// Update godoc
func (h *LandHandler) Update(w http.ResponseWriter, r *http.Request) {
	var request LandRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	land := landFromRequest(request, chi.URLParam(r, "id"))
	updated, err := h.useCases.Update(r.Context(), land)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Data lahan berhasil diperbarui", updated)
}

// Delete godoc
func (h *LandHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

// SetPolygon godoc
func (h *LandHandler) SetPolygon(w http.ResponseWriter, r *http.Request) {
	var request PolygonRequest
	if err := decodeRequest(w, r, &request); err != nil {
		writeModuleError(w, r, err)
		return
	}
	encodedPolygon, err := json.Marshal(request.Polygon)
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	land, err := h.useCases.SetPolygon(r.Context(), chi.URLParam(r, "id"), string(encodedPolygon))
	if err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeSuccessResponse(w, http.StatusOK, "Polygon lahan berhasil disimpan", land)
}

// DeletePolygon godoc
func (h *LandHandler) DeletePolygon(w http.ResponseWriter, r *http.Request) {
	if err := h.useCases.DeletePolygon(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeModuleError(w, r, err)
		return
	}
	writeNoContent(w)
}

func landFromRequest(request LandRequest, id string) *domain.Land {
	return &domain.Land{
		ID: id, FarmerID: request.FarmerID, PlotName: request.PlotName, Hamlet: request.Hamlet,
		ElevationM: request.Elevation, Latitude: request.Latitude, Longitude: request.Longitude,
	}
}
