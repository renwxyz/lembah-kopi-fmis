package http

import (
	"net/http"
	"net/url"
	"strings"

	"lembah-kopi/core-system/docs"
	"lembah-kopi/core-system/internal/delivery/http/handler"
	"lembah-kopi/core-system/internal/delivery/http/middleware"
	"lembah-kopi/core-system/internal/delivery/http/problem"
	"lembah-kopi/core-system/internal/domain"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"
)

type routerOptions struct {
	auditHandler  *handler.AuditHandler
	auditRecorder middleware.AuditRecorder
	cmsHandler    *handler.CMSHandler
	healthHandler *handler.HealthHandler
}

// RouterOption mengonfigurasi fitur opsional router.
type RouterOption func(*routerOptions)

// WithHealthHandler menambahkan health check probe endpoint (/healthz dan /readyz).
func WithHealthHandler(h *handler.HealthHandler) RouterOption {
	return func(o *routerOptions) {
		o.healthHandler = h
	}
}

// WithCMS mengaktifkan endpoint community profile: GET /public/home (tanpa auth)
// dan /cms/* (SUPER_ADMIN & ADMIN; operasi hapus hanya SUPER_ADMIN).
func WithCMS(cmsHandler *handler.CMSHandler) RouterOption {
	return func(o *routerOptions) {
		o.cmsHandler = cmsHandler
	}
}

// WithAudit mengaktifkan pencatatan audit trail dan endpoint GET /audit-log (SUPER_ADMIN).
func WithAudit(auditHandler *handler.AuditHandler, recorder middleware.AuditRecorder) RouterOption {
	return func(o *routerOptions) {
		o.auditHandler = auditHandler
		o.auditRecorder = recorder
	}
}

func NewRouter(
	authHandler *handler.AuthHandler,
	farmerHandler *handler.FarmerHandler,
	landHandler *handler.LandHandler,
	inventoryHandler *handler.CropInventoryHandler,
	populationHandler *handler.TreePopulationHandler,
	soilConditionHandler *handler.SoilConditionHandler,
	fertilizationHandler *handler.FertilizationHandler,
	pestDiseaseHandler *handler.PestDiseaseHandler,
	harvestHandler *handler.HarvestHandler,
	processingMethodHandler *handler.ProcessingMethodHandler,
	processingBatchHandler *handler.ProcessingBatchHandler,
	dashboardHandler *handler.DashboardHandler,
	jwtSecret string,
	allowedOrigins []string,
	opts ...RouterOption,
) *chi.Mux {
	var options routerOptions
	for _, opt := range opts {
		opt(&options)
	}
	r := chi.NewRouter()
	originAllowlist := make(map[string]struct{}, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		norm := normalizeOrigin(origin)
		if norm != "" {
			originAllowlist[norm] = struct{}{}
		}
	}

	r.Use(middleware.RealIP)
	r.Use(middleware.SecurityHeaders)
	r.Use(chiMiddleware.Logger)
	r.Use(problem.Recoverer)
	r.Use(chiMiddleware.RequestID)
	r.NotFound(func(w http.ResponseWriter, req *http.Request) {
		problem.Write(w, req, http.StatusNotFound, "https://api.lembahkopi.id/problems/not-found", "Resource not found", "No route matches this request.")
	})

	r.Use(cors.Handler(cors.Options{
		AllowOriginFunc: func(_ *http.Request, origin string) bool {
			norm := normalizeOrigin(origin)
			_, allowed := originAllowlist[norm]
			return allowed || isVSCodeWebviewOrigin(origin)
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Requested-With"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/yaml")
		http.ServeFileFS(w, r, docs.FS, "openapi.yaml")
	})
	r.Get("/swagger/*", httpSwagger.Handler(httpSwagger.URL("/openapi.yaml")))

	if options.healthHandler != nil {
		r.Get("/healthz", options.healthHandler.Liveness)
		r.Get("/readyz", options.healthHandler.Readiness)
	} else {
		r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"status":"UP"}`))
		})
	}

	// Rate limiter untuk proteksi endpoint login (10 requests burst, replenish 0.2/sec = 12/min)
	loginRateLimiter := middleware.NewIPRateLimiter(0.2, 10)

	r.Route("/api/v1", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(loginRateLimiter.LimitHandler)
			if options.auditRecorder != nil {
				r.Use(middleware.AuditLogin(options.auditRecorder))
			}
			r.Post("/auth/login", authHandler.Login)
		})

		if options.cmsHandler != nil {
			r.Get("/public/home", options.cmsHandler.PublicHome)
		}

		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(jwtSecret))
			if options.auditRecorder != nil {
				r.Use(middleware.AuditMutations(options.auditRecorder))
			}

			r.Get("/auth/me", authHandler.GetProfile)
			r.Put("/auth/password", authHandler.ChangePassword)

			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireRole(domain.RoleSuperAdmin, domain.RoleAdminKelompokTani))

				r.Get("/dashboard/overview", dashboardHandler.GetOverview)

				r.Route("/petani", func(r chi.Router) {
					r.Get("/", farmerHandler.List)
					r.Post("/", farmerHandler.Create)
					r.Get("/{id}", farmerHandler.Get)
					r.Put("/{id}", farmerHandler.Update)
					r.Delete("/{id}", farmerHandler.Delete)
				})

				r.Route("/lahan", func(r chi.Router) {
					r.Get("/", landHandler.List)
					r.Post("/", landHandler.Create)
					r.Get("/{id}", landHandler.Get)
					r.Put("/{id}", landHandler.Update)
					r.Delete("/{id}", landHandler.Delete)
					r.Put("/{id}/polygon", landHandler.SetPolygon)
					r.Delete("/{id}/polygon", landHandler.DeletePolygon)
					r.Get("/{id}/inventaris", inventoryHandler.ListByLand)
					r.Post("/{id}/inventaris", inventoryHandler.Create)
					r.Get("/{id}/populasi-pohon", populationHandler.GetByLand)
					r.Get("/{id}/kondisi-tanah", soilConditionHandler.ListByLand)
					r.Post("/{id}/kondisi-tanah", soilConditionHandler.Create)
					r.Get("/{id}/pemupukan", fertilizationHandler.ListByLand)
					r.Post("/{id}/pemupukan", fertilizationHandler.Create)
					r.Get("/{id}/hama-penyakit", pestDiseaseHandler.ListByLand)
					r.Post("/{id}/hama-penyakit", pestDiseaseHandler.Create)
					r.Get("/{id}/panen", harvestHandler.ListByLand)
					r.Post("/{id}/panen", harvestHandler.Create)
				})

				r.Get("/panen/{id}", harvestHandler.Get)
				r.Put("/panen/{id}", harvestHandler.Update)
				r.Delete("/panen/{id}", harvestHandler.Delete)
				r.Get("/metode-pascaproses", processingMethodHandler.List)
				r.Route("/batch", func(r chi.Router) {
					r.Get("/", processingBatchHandler.List)
					r.Post("/", processingBatchHandler.Create)
					r.Get("/{id}", processingBatchHandler.Get)
					r.Put("/{id}", processingBatchHandler.Update)
					r.Delete("/{id}", processingBatchHandler.Delete)
					r.Get("/{id}/tahap", processingBatchHandler.ListStages)
					r.Post("/{id}/tahap", processingBatchHandler.AddStage)
					r.Get("/{id}/panen", processingBatchHandler.ListMappings)
					r.Post("/{id}/panen", processingBatchHandler.AddMapping)
					r.Put("/{id}/panen/{mapping_id}", processingBatchHandler.UpdateMapping)
					r.Delete("/{id}/panen/{mapping_id}", processingBatchHandler.DeleteMapping)
					r.Get("/{id}/traceability", processingBatchHandler.GetTraceability)
				})

				r.Get("/kondisi-tanah/{id}", soilConditionHandler.Get)
				r.Get("/pemupukan/{id}", fertilizationHandler.Get)
				r.Put("/pemupukan/{id}", fertilizationHandler.Update)
				r.Delete("/pemupukan/{id}", fertilizationHandler.Delete)
				r.Get("/hama-penyakit/{id}", pestDiseaseHandler.Get)
				r.Put("/hama-penyakit/{id}", pestDiseaseHandler.Update)
				r.Delete("/hama-penyakit/{id}", pestDiseaseHandler.Delete)
				r.Get("/hama-penyakit/{id}/penanganan", pestDiseaseHandler.ListTreatments)
				r.Post("/hama-penyakit/{id}/penanganan", pestDiseaseHandler.AddTreatment)

				r.Route("/inventaris", func(r chi.Router) {
					r.Get("/{id}", inventoryHandler.Get)
					r.Put("/{id}", inventoryHandler.Update)
					r.Delete("/{id}", inventoryHandler.Delete)
					r.Put("/{id}/populasi-pohon", populationHandler.SetForInventory)
				})
			})

			if options.cmsHandler != nil {
				cms := options.cmsHandler
				r.Group(func(r chi.Router) {
					r.Use(middleware.RequireRole(domain.RoleSuperAdmin, domain.RoleAdminKelompokTani))
					r.Post("/cms/upload", cms.UploadImage)
					r.Get("/cms/pengaturan", cms.GetSettings)
					r.Put("/cms/pengaturan", cms.UpdateSettings)

					r.Get("/cms/produk", cms.ListProducts)
					r.Post("/cms/produk", cms.CreateProduct)
					r.Get("/cms/produk/{id}", cms.GetProduct)
					r.Put("/cms/produk/{id}", cms.UpdateProduct)

					r.Get("/cms/media", cms.ListMedia)
					r.Post("/cms/media", cms.CreateMedia)
					r.Put("/cms/media/{id}", cms.UpdateMedia)
					r.Put("/cms/media/{id}/tampil", cms.SetMediaVisible)

					r.Get("/cms/agenda", cms.ListAgenda)
					r.Post("/cms/agenda", cms.CreateAgenda)
					r.Put("/cms/agenda/{id}", cms.UpdateAgenda)

					r.Get("/cms/galeri", cms.ListGallery)
					r.Post("/cms/galeri", cms.CreateGalleryPhoto)
					r.Put("/cms/galeri/{id}", cms.UpdateGalleryPhoto)
				})
			}

			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireRole(domain.RoleSuperAdmin))
				if options.auditHandler != nil {
					r.Get("/audit-log", options.auditHandler.List)
				}
				if options.cmsHandler != nil {
					cms := options.cmsHandler
					r.Delete("/cms/produk/{id}", cms.DeleteProduct)
					r.Delete("/cms/media/{id}", cms.DeleteMedia)
					r.Delete("/cms/agenda/{id}", cms.DeleteAgenda)
					r.Delete("/cms/galeri/{id}", cms.DeleteGalleryPhoto)
				}
				r.Post("/admin", authHandler.CreateAdmin)
				r.Post("/metode-pascaproses", processingMethodHandler.Create)
				r.Put("/metode-pascaproses/{kode}", processingMethodHandler.Update)
				r.Delete("/metode-pascaproses/{kode}", processingMethodHandler.Delete)
			})
		})
	})

	return r
}

func normalizeOrigin(origin string) string {
	origin = strings.TrimSpace(origin)
	origin = strings.TrimRight(origin, "/")
	return strings.ToLower(origin)
}

func isVSCodeWebviewOrigin(origin string) bool {
	parsed, err := url.Parse(origin)
	if err != nil || parsed.Host == "" || parsed.User != nil ||
		parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" {
		return false
	}

	if parsed.Scheme == "vscode-webview" {
		return true
	}

	return parsed.Scheme == "https" &&
		strings.HasSuffix(strings.ToLower(parsed.Hostname()), ".vscode-webview.net")
}
