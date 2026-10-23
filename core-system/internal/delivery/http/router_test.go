package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"lembah-kopi/core-system/internal/delivery/http/handler"
	"lembah-kopi/core-system/internal/delivery/http/problem"
	"lembah-kopi/core-system/internal/domain"

	"github.com/golang-jwt/jwt/v5"
)

func TestCORSAllowsConfiguredOriginWithoutCredentials(t *testing.T) {
	response := corsPreflight(t, "https://app.example", []string{"https://app.example", "https://admin.example"})

	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "https://app.example" {
		t.Fatalf("Access-Control-Allow-Origin = %q, want %q", got, "https://app.example")
	}
	if got := response.Header().Get("Access-Control-Allow-Credentials"); got != "" {
		t.Fatalf("Access-Control-Allow-Credentials = %q, want it to be absent", got)
	}
}

func TestCORSPreflightAllowsLocalFrontendLogin(t *testing.T) {
	router := NewRouter(
		(*handler.AuthHandler)(nil),
		nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil,
		"test-secret",
		[]string{"http://localhost:3000"},
	)
	request := httptest.NewRequest(http.MethodOptions, "/api/v1/auth/login", nil)
	request.Header.Set("Origin", "http://localhost:3000")
	request.Header.Set("Access-Control-Request-Method", http.MethodPost)
	request.Header.Set("Access-Control-Request-Headers", "content-type,authorization,x-requested-with")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusOK && response.Code != http.StatusNoContent {
		t.Fatalf("preflight status = %d, want 200 or 204", response.Code)
	}
	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Fatalf("Access-Control-Allow-Origin = %q, want http://localhost:3000", got)
	}
	if got := response.Header().Get("Access-Control-Allow-Methods"); !strings.Contains(got, http.MethodPost) {
		t.Fatalf("Access-Control-Allow-Methods = %q, want POST included", got)
	}
	for _, header := range []string{"content-type", "authorization", "x-requested-with"} {
		if got := strings.ToLower(response.Header().Get("Access-Control-Allow-Headers")); !strings.Contains(got, header) {
			t.Fatalf("Access-Control-Allow-Headers = %q, want %q included", got, header)
		}
	}
	if got := response.Header().Get("Access-Control-Allow-Credentials"); got != "" {
		t.Fatalf("Access-Control-Allow-Credentials = %q, want it absent for bearer-token auth", got)
	}
}

func TestCORSRejectsUnconfiguredOrigin(t *testing.T) {
	response := corsPreflight(t, "https://untrusted.example", []string{"https://app.example"})

	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("Access-Control-Allow-Origin = %q, want it to be absent", got)
	}
}

func TestCORSAllowsVSCodeWebviewOrigins(t *testing.T) {
	for _, origin := range []string{
		"vscode-webview://12345678-1234-1234-1234-123456789abc",
		"https://12345678-1234-1234-1234-123456789abc.vscode-webview.net",
	} {
		t.Run(origin, func(t *testing.T) {
			response := corsPreflight(t, origin, nil)
			if got := response.Header().Get("Access-Control-Allow-Origin"); got != origin {
				t.Fatalf("Access-Control-Allow-Origin = %q, want %q", got, origin)
			}
		})
	}
}

func TestCORSRejectsLookalikeVSCodeWebviewOrigin(t *testing.T) {
	response := corsPreflight(t, "https://vscode-webview.net.attacker.example", nil)

	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("Access-Control-Allow-Origin = %q, want it to be absent", got)
	}
}

func TestModuleOneRoutesRequireAuthentication(t *testing.T) {
	router := NewRouter(
		(*handler.AuthHandler)(nil),
		(*handler.FarmerHandler)(nil),
		(*handler.LandHandler)(nil),
		(*handler.CropInventoryHandler)(nil),
		(*handler.TreePopulationHandler)(nil),
		(*handler.SoilConditionHandler)(nil),
		(*handler.FertilizationHandler)(nil),
		(*handler.PestDiseaseHandler)(nil),
		(*handler.HarvestHandler)(nil),
		(*handler.ProcessingMethodHandler)(nil),
		(*handler.ProcessingBatchHandler)(nil),
		(*handler.DashboardHandler)(nil),
		"test-secret",
		nil,
	)
	for _, test := range []struct {
		method string
		path   string
	}{
		{method: http.MethodGet, path: "/api/v1/petani"},
		{method: http.MethodGet, path: "/api/v1/lahan"},
		{method: http.MethodPut, path: "/api/v1/lahan/LHN-001/polygon"},
		{method: http.MethodGet, path: "/api/v1/lahan/LHN-001/inventaris"},
		{method: http.MethodGet, path: "/api/v1/lahan/LHN-001/populasi-pohon"},
		{method: http.MethodGet, path: "/api/v1/inventaris/INV-001"},
		{method: http.MethodPut, path: "/api/v1/inventaris/INV-001/populasi-pohon"},
		{method: http.MethodGet, path: "/api/v1/lahan/LHN-001/kondisi-tanah"},
		{method: http.MethodPost, path: "/api/v1/lahan/LHN-001/pemupukan"},
		{method: http.MethodGet, path: "/api/v1/lahan/LHN-001/hama-penyakit"},
		{method: http.MethodPost, path: "/api/v1/hama-penyakit/HMA-001/penanganan"},
		{method: http.MethodGet, path: "/api/v1/lahan/LHN-001/panen"},
		{method: http.MethodGet, path: "/api/v1/panen/PNN-001"},
		{method: http.MethodGet, path: "/api/v1/metode-pascaproses"},
		{method: http.MethodGet, path: "/api/v1/batch"},
		{method: http.MethodGet, path: "/api/v1/batch/BAT-001/traceability"},
		{method: http.MethodGet, path: "/api/v1/dashboard/overview"},
	} {
		t.Run(test.path, func(t *testing.T) {
			request := httptest.NewRequest(test.method, test.path, nil)
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)
			if response.Code != http.StatusUnauthorized {
				t.Fatalf("status = %d, want %d", response.Code, http.StatusUnauthorized)
			}
			if got := response.Header().Get("Content-Type"); got != "application/problem+json" {
				t.Fatalf("Content-Type = %q, want application/problem+json", got)
			}
			var body map[string]any
			if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
				t.Fatalf("decode problem response: %v", err)
			}
			if body["status"] != float64(http.StatusUnauthorized) || body["title"] == nil || body["type"] == nil {
				t.Fatalf("response is not RFC 9457 problem details: %#v", body)
			}
		})
	}
}

func TestOpenAPISpecAndSwaggerUIAreServed(t *testing.T) {
	router := NewRouter(
		(*handler.AuthHandler)(nil),
		(*handler.FarmerHandler)(nil),
		(*handler.LandHandler)(nil),
		(*handler.CropInventoryHandler)(nil),
		(*handler.TreePopulationHandler)(nil),
		(*handler.SoilConditionHandler)(nil),
		(*handler.FertilizationHandler)(nil),
		(*handler.PestDiseaseHandler)(nil),
		(*handler.HarvestHandler)(nil),
		(*handler.ProcessingMethodHandler)(nil),
		(*handler.ProcessingBatchHandler)(nil),
		(*handler.DashboardHandler)(nil),
		"test-secret",
		nil,
	)

	specResponse := httptest.NewRecorder()
	router.ServeHTTP(specResponse, httptest.NewRequest(http.MethodGet, "/openapi.yaml", nil))
	if specResponse.Code != http.StatusOK {
		t.Fatalf("OpenAPI status = %d, want %d", specResponse.Code, http.StatusOK)
	}
	if got := specResponse.Header().Get("Content-Type"); got != "application/yaml" {
		t.Fatalf("OpenAPI Content-Type = %q, want application/yaml", got)
	}
	if !strings.Contains(specResponse.Body.String(), "openapi: 3.0.3") {
		t.Fatal("served OpenAPI contract does not declare OpenAPI 3.0.3")
	}

	uiResponse := httptest.NewRecorder()
	router.ServeHTTP(uiResponse, httptest.NewRequest(http.MethodGet, "/swagger/index.html", nil))
	if uiResponse.Code != http.StatusOK {
		t.Fatalf("Swagger UI status = %d, want %d", uiResponse.Code, http.StatusOK)
	}
	if !strings.Contains(uiResponse.Body.String(), "/openapi.yaml") {
		t.Fatal("Swagger UI is not configured to load the canonical OpenAPI contract")
	}
}

func TestUnmatchedRouteUsesProblemDetails(t *testing.T) {
	router := NewRouter(nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, "", nil)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/not-a-route", nil))

	if response.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNotFound)
	}
	if got := response.Header().Get("Content-Type"); got != "application/problem+json" {
		t.Fatalf("Content-Type = %q, want application/problem+json", got)
	}
	var body map[string]any
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode problem response: %v", err)
	}
	if body["status"] != float64(http.StatusNotFound) || body["instance"] != "/not-a-route" {
		t.Fatalf("unexpected problem details: %#v", body)
	}
}

func TestPanicBeforeResponseUsesProblemDetails(t *testing.T) {
	handler := problem.Recoverer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("test panic")
	}))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/panic", nil))

	if response.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusInternalServerError)
	}
	if got := response.Header().Get("Content-Type"); got != "application/problem+json" {
		t.Fatalf("Content-Type = %q, want application/problem+json", got)
	}
}

func corsPreflight(t *testing.T, origin string, allowedOrigins []string) *httptest.ResponseRecorder {
	t.Helper()

	router := NewRouter(
		(*handler.AuthHandler)(nil),
		(*handler.FarmerHandler)(nil),
		(*handler.LandHandler)(nil),
		(*handler.CropInventoryHandler)(nil),
		(*handler.TreePopulationHandler)(nil),
		(*handler.SoilConditionHandler)(nil),
		(*handler.FertilizationHandler)(nil),
		(*handler.PestDiseaseHandler)(nil),
		(*handler.HarvestHandler)(nil),
		(*handler.ProcessingMethodHandler)(nil),
		(*handler.ProcessingBatchHandler)(nil),
		(*handler.DashboardHandler)(nil),
		"",
		allowedOrigins,
	)
	request := httptest.NewRequest("OPTIONS", "/api/v1/auth/me", nil)
	request.Header.Set("Origin", origin)
	request.Header.Set("Access-Control-Request-Method", "GET")
	request.Header.Set("Access-Control-Request-Headers", "Authorization, X-Requested-With")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)
	return response
}

type mockDashboardUseCases struct {
	overview *domain.DashboardOverview
	err      error
}

func (m *mockDashboardUseCases) GetOverview(_ context.Context) (*domain.DashboardOverview, error) {
	return m.overview, m.err
}

func TestDashboardOverviewRoute_Success(t *testing.T) {
	jwtSecret := "supersecretjwtkeythatisatleast32chars"
	mockUseCases := &mockDashboardUseCases{
		overview: &domain.DashboardOverview{
			Summary: domain.DashboardSummary{
				FarmerCount:           10,
				LandAreaM2:            50000,
				CurrentMonthHarvestKG: 1500,
				ActiveBatchCount:      3,
			},
			MapLands:       []domain.DashboardMapLand{},
			ActiveBatches:  []domain.DashboardBatch{},
			FarmAlerts:     []domain.DashboardFarmAlert{},
			RecentHarvests: []domain.DashboardHarvest{},
		},
	}
	dashboardHandler := handler.NewDashboardHandler(mockUseCases)

	router := NewRouter(
		(*handler.AuthHandler)(nil),
		(*handler.FarmerHandler)(nil),
		(*handler.LandHandler)(nil),
		(*handler.CropInventoryHandler)(nil),
		(*handler.TreePopulationHandler)(nil),
		(*handler.SoilConditionHandler)(nil),
		(*handler.FertilizationHandler)(nil),
		(*handler.PestDiseaseHandler)(nil),
		(*handler.HarvestHandler)(nil),
		(*handler.ProcessingMethodHandler)(nil),
		(*handler.ProcessingBatchHandler)(nil),
		dashboardHandler,
		jwtSecret,
		nil,
	)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  "ADM-001",
		"role": string(domain.RoleAdminKelompokTani),
		"exp":  time.Now().Add(time.Hour).Unix(),
	})
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/dashboard/overview", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	res := httptest.NewRecorder()

	router.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body: %s", res.Code, http.StatusOK, res.Body.String())
	}

	var payload struct {
		Success bool                     `json:"success"`
		Message string                   `json:"message"`
		Data    domain.DashboardOverview `json:"data"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response body: %v", err)
	}
	if !payload.Success {
		t.Fatalf("success = false, want true")
	}
	if payload.Data.Summary.FarmerCount != 10 {
		t.Fatalf("farmer count = %d, want 10", payload.Data.Summary.FarmerCount)
	}
}
