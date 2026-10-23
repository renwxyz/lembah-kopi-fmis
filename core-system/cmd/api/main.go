package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"lembah-kopi/core-system/internal/config"
	httpdelivery "lembah-kopi/core-system/internal/delivery/http"
	"lembah-kopi/core-system/internal/delivery/http/handler"
	"lembah-kopi/core-system/internal/repository/postgres"
	"lembah-kopi/core-system/internal/service"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	if err := run(); err != nil {
		slog.Error("API server stopped with an error", "error", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	slog.Info("starting API server", "http_address", cfg.HTTPAddress)

	db, err := sql.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("open database connection: %w", err)
	}
	defer db.Close()
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		return fmt.Errorf("connect to database: %w", err)
	}
	slog.Info("database connection established")

	authRepository := postgres.NewAuthRepository(db)
	farmerRepository := postgres.NewFarmerRepository(db)
	landRepository := postgres.NewLandRepository(db)
	inventoryRepository := postgres.NewCropInventoryRepository(db)
	populationRepository := postgres.NewTreePopulationRepository(db)
	soilConditionRepository := postgres.NewSoilConditionRepository(db)
	fertilizationRepository := postgres.NewFertilizationRepository(db)
	pestDiseaseRepository := postgres.NewPestDiseaseRepository(db)
	harvestRepository := postgres.NewHarvestRepository(db)
	processingMethodRepository := postgres.NewProcessingMethodRepository(db)
	processingBatchRepository := postgres.NewProcessingBatchRepository(db)
	dashboardRepository := postgres.NewDashboardRepository(db)

	authHandler := handler.NewAuthHandler(service.NewAuthService(authRepository, cfg.JWTSecret))
	farmerHandler := handler.NewFarmerHandler(service.NewFarmerService(farmerRepository))
	landHandler := handler.NewLandHandler(service.NewLandService(landRepository))
	inventoryHandler := handler.NewCropInventoryHandler(service.NewCropInventoryService(inventoryRepository))
	populationHandler := handler.NewTreePopulationHandler(service.NewTreePopulationService(populationRepository))
	soilConditionHandler := handler.NewSoilConditionHandler(service.NewSoilConditionService(soilConditionRepository))
	fertilizationHandler := handler.NewFertilizationHandler(service.NewFertilizationService(fertilizationRepository))
	pestDiseaseHandler := handler.NewPestDiseaseHandler(service.NewPestDiseaseService(pestDiseaseRepository))
	harvestHandler := handler.NewHarvestHandler(service.NewHarvestService(harvestRepository))
	processingMethodHandler := handler.NewProcessingMethodHandler(service.NewProcessingMethodService(processingMethodRepository))
	processingBatchHandler := handler.NewProcessingBatchHandler(service.NewProcessingBatchService(processingBatchRepository, processingMethodRepository))
	dashboardHandler := handler.NewDashboardHandler(service.NewDashboardService(dashboardRepository))

	server := &http.Server{
		Addr: cfg.HTTPAddress,
		Handler: httpdelivery.NewRouter(
			authHandler, farmerHandler, landHandler, inventoryHandler, populationHandler,
			soilConditionHandler, fertilizationHandler, pestDiseaseHandler,
			harvestHandler, processingMethodHandler, processingBatchHandler,
			dashboardHandler,
			cfg.JWTSecret, cfg.CORSAllowedOrigins,
		),
		ReadHeaderTimeout: 5 * time.Second,
	}

	listener, err := net.Listen("tcp", cfg.HTTPAddress)
	if err != nil {
		return fmt.Errorf("listen on %s: %w", cfg.HTTPAddress, err)
	}
	slog.Info("HTTP server listening", "address", listener.Addr().String())

	serverErrors := make(chan error, 1)
	go func() {
		serverErrors <- server.Serve(listener)
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	select {
	case err := <-serverErrors:
		if !errors.Is(err, http.ErrServerClosed) {
			return fmt.Errorf("serve HTTP: %w", err)
		}
	case <-stop:
		slog.Info("shutting down HTTP server")
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			return fmt.Errorf("shut down HTTP server: %w", err)
		}
		slog.Info("HTTP server stopped")
	}
	return nil
}
