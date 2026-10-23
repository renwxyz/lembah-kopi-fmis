#!/bin/bash
set -e

echo "==> [Lembah Kopi] Menyiapkan database dan PostGIS..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS postgis;
EOSQL

echo "==> [Lembah Kopi] Menjalankan migrasi schema dan initial seed data..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -f /docker-migrations/000001_init_lembah_kopi_schema.up.sql \
  -f /docker-migrations/000002_seed_initial_data.sql \
  -f /docker-migrations/000003_add_agronomy_monitoring_history.up.sql \
  -f /docker-migrations/000004_extend_harvest_batch_traceability.up.sql

echo "==> [Lembah Kopi] Migrasi dan seed data selesai successfully!"
