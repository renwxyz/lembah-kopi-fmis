DROP TRIGGER IF EXISTS update_batch_pascaproses_modtime ON batch_pascaproses;
DROP TRIGGER IF EXISTS update_riwayat_panen_modtime ON riwayat_panen;
DROP TRIGGER IF EXISTS update_riwayat_hama_penyakit_modtime ON riwayat_hama_penyakit;
DROP TRIGGER IF EXISTS update_riwayat_pemupukan_modtime ON riwayat_pemupukan;
DROP TRIGGER IF EXISTS update_inventaris_tanaman_modtime ON inventaris_tanaman;
DROP TRIGGER IF EXISTS update_lahan_modtime ON lahan;
DROP TRIGGER IF EXISTS update_petani_modtime ON petani;
DROP TRIGGER IF EXISTS update_pengguna_admin_modtime ON pengguna_admin;
DROP TRIGGER IF EXISTS trigger_calculate_lahan_luas ON lahan;

DROP FUNCTION IF EXISTS trg_update_timestamp();
DROP FUNCTION IF EXISTS trg_calculate_lahan_luas();

DROP TABLE IF EXISTS batch_panen_mapping CASCADE;
DROP TABLE IF EXISTS batch_pascaproses CASCADE;
DROP TABLE IF EXISTS riwayat_panen CASCADE;
DROP TABLE IF EXISTS riwayat_hama_penyakit CASCADE;
DROP TABLE IF EXISTS riwayat_pemupukan CASCADE;
DROP TABLE IF EXISTS log_kondisi_tanah CASCADE;
DROP TABLE IF EXISTS inventaris_tanaman CASCADE;
DROP TABLE IF EXISTS lahan CASCADE;
DROP TABLE IF EXISTS petani CASCADE;
DROP TABLE IF EXISTS pengguna_admin CASCADE;

DROP TYPE IF EXISTS enum_role_admin;
DROP TYPE IF EXISTS enum_status_proses;
DROP TYPE IF EXISTS enum_metode_proses;
DROP TYPE IF EXISTS enum_status_alokasi;
DROP TYPE IF EXISTS enum_metode_petik;
DROP TYPE IF EXISTS enum_status_penanganan;
DROP TYPE IF EXISTS enum_tingkat_serangan;
DROP TYPE IF EXISTS enum_kelompok_usia;
DROP TYPE IF EXISTS enum_varietas;