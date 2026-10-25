.PHONY: help db minio db-down db-reset db-seed run-backend run-frontend run-compro docker-up docker-down test

help:
	@echo "=========================================================="
	@echo " Lembah Kopi FMIS - Developer Commands"
	@echo "=========================================================="
	@echo "  make db            - Start PostgreSQL + PostGIS (Docker)"
	@echo "  make minio         - Start MinIO object storage for CMS photos (Docker)"
	@echo "  make db-down       - Stop PostgreSQL container"
	@echo "  make db-reset      - Reset DB volume & re-run all migrations"
	@echo "  make db-seed       - Re-run SQL migrations & initial seed"
	@echo "  make run-backend   - Run Go API locally (port 8080)"
	@echo "  make run-frontend  - Run Next.js dashboard locally (port 3000)"
	@echo "  make run-compro    - Run Next.js public profile locally (port 3001)"
	@echo "  make docker-up     - Run entire stack via Docker Compose"
	@echo "  make docker-down   - Stop all Docker containers"
	@echo "  make test          - Run backend & frontend tests"
	@echo "=========================================================="

db:
	docker compose up -d postgres

minio:
	docker compose up -d minio

db-down:
	docker compose down

db-seed:
	@echo "Running migrations and seeds inside lembah_kopi_db..."
	docker exec -i lembah_kopi_db psql -U postgres -d lembah_kopi_db -v ON_ERROR_STOP=1 \
		-f /docker-migrations/000001_init_lembah_kopi_schema.up.sql \
		-f /docker-migrations/000002_seed_initial_data.sql \
		-f /docker-migrations/000003_add_agronomy_monitoring_history.up.sql \
		-f /docker-migrations/000004_extend_harvest_batch_traceability.up.sql \
		-f /docker-migrations/000005_add_audit_log.up.sql \
		-f /docker-migrations/000006_add_cms.up.sql
	@echo "Database successfully migrated and seeded!"

db-reset:
	docker compose down -v
	docker compose up -d postgres

run-backend:
	@if [ ! -f core-system/.env ]; then cp core-system/.env.example core-system/.env; echo "Created core-system/.env from template"; fi
	cd core-system && env $$(cat .env | grep -v '^#' | xargs) go run ./cmd/api

run-frontend:
	@if [ ! -f web-dashboard/.env.local ]; then cp web-dashboard/.env.example web-dashboard/.env.local; echo "Created web-dashboard/.env.local from template"; fi
	cd web-dashboard && npm run dev

run-compro:
	@if [ ! -f web-compro/.env.local ]; then cp web-compro/.env.example web-compro/.env.local; echo "Created web-compro/.env.local from template"; fi
	cd web-compro && npm run dev


docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

test:
	@echo "Testing backend..."
	cd core-system && go test -v ./...
	@echo "Checking frontend types & build..."
	cd web-dashboard && npm run typecheck
	@echo "Checking community profile types..."
	cd web-compro && npm run typecheck
