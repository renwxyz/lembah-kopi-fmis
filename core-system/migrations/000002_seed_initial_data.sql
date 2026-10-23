-- 1. SEED PENGGUNA ADMIN TESTING
-- Kredensial testing: superadmin / admin_glodogan dengan password AdminLembahKopi2026!
INSERT INTO pengguna_admin (id_admin, username, email, password_hash, nama_lengkap, role, status_aktif)
VALUES 
    ('ADM-001', 'superadmin', 'admin@lembahkopi.id', '$2a$10$RYGuLcSP2g.eJcpol9gVIOJZFcr7vo.QkdIcUwxL/BHL.MhYSMYdG', 'Super Admin FMIS', 'SUPER_ADMIN', TRUE),
    ('ADM-002', 'admin_glodogan', 'glodogan@lembahkopi.id', '$2a$10$RYGuLcSP2g.eJcpol9gVIOJZFcr7vo.QkdIcUwxL/BHL.MhYSMYdG', 'Admin Kelompok Tani Glodogan', 'ADMIN_KELOMPOK_TANI', TRUE)
ON CONFLICT (id_admin) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    nama_lengkap = EXCLUDED.nama_lengkap,
    role = EXCLUDED.role,
    status_aktif = EXCLUDED.status_aktif,
    updated_at = CURRENT_TIMESTAMP;

-- 2. SEED PETANI
INSERT INTO petani (id_petani, nama_lengkap, no_hp)
VALUES 
    ('PTN-GLD-001', 'Pak Sutarjo', '081234567890'),
    ('PTN-GLD-002', 'Pak Bambang', '085678901234')
ON CONFLICT (id_petani) DO NOTHING;

-- 3. SEED LAHAN (PostGIS Polygon Glodogan & Auto-trigger luas_m2)
INSERT INTO lahan (id_lahan, id_petani, nama_petak, dusun, elevasi_mdpl, latitude, longitude, polygon_geom, total_pohon)
VALUES 
    (
        'LHN-GLD-001', 
        'PTN-GLD-001', 
        'Blok Gumuk Barat', 
        'Glodogan Krajan', 
        1250, 
        -7.33050000, 
        110.00500000, 
        ST_GeomFromText('POLYGON((110.0050 -7.3305, 110.0060 -7.3305, 110.0060 -7.3315, 110.0050 -7.3315, 110.0050 -7.3305))', 4326),
        1500
    ),
    (
        'LHN-GLD-002', 
        'PTN-GLD-002', 
        'Blok Serang Timur', 
        'Glodogan Lintas', 
        1380, 
        -7.33200000, 
        110.00700000, 
        ST_GeomFromText('POLYGON((110.0070 -7.3320, 110.0080 -7.3320, 110.0080 -7.3330, 110.0070 -7.3330, 110.0070 -7.3320))', 4326),
        2000
    )
ON CONFLICT (id_lahan) DO NOTHING;

-- 4. SEED INVENTARIS TANAMAN
INSERT INTO inventaris_tanaman (id_inventaris, id_lahan, varietas, jumlah_pohon, kelompok_usia)
VALUES 
    ('INV-LHN01-01', 'LHN-GLD-001', 'ARABIKA', 1000, 'LIMA_BELAS_TAHUN_KURANG'),
    ('INV-LHN01-02', 'LHN-GLD-001', 'ROBUSTA', 500, 'LIMA_TAHUN_KURANG'),
    ('INV-LHN02-01', 'LHN-GLD-002', 'ARABIKA', 2000, 'LIMA_BELAS_TAHUN_LEBIH')
ON CONFLICT (id_inventaris) DO NOTHING;

-- 5. SEED LOG KONDISI TANAH (Sampling 6-in-1 Soil Analyzer)
INSERT INTO log_kondisi_tanah (id_log_tanah, id_lahan, tanggal_ukur, ph_tanah, kelembapan, suhu_celsius, n_value, p_value, k_value, ec_value)
VALUES 
    ('LOG-LHN01-001', 'LHN-GLD-001', '2026-08-01 08:30:00+07', 5.8, 65.50, 22.5, 120, 45, 110, 450),
    ('LOG-LHN01-002', 'LHN-GLD-001', '2026-09-01 09:00:00+07', 6.2, 70.00, 21.0, 180, 60, 150, 520),
    ('LOG-LHN02-001', 'LHN-GLD-002', '2026-09-05 08:00:00+07', 5.5, 60.00, 20.5, 100, 35, 95, 410)
ON CONFLICT (id_log_tanah) DO NOTHING;

-- 6. SEED RIWAYAT PEMUPUKAN
INSERT INTO riwayat_pemupukan (id_pemupukan, id_lahan, tanggal_aplikasi, jenis_pupuk, dosis_kg)
VALUES 
    ('PUP-LHN01-01', 'LHN-GLD-001', '2026-08-15', 'NPK Organik 16-16-16', 150.00),
    ('PUP-LHN02-01', 'LHN-GLD-002', '2026-08-20', 'Kompos Kasgot', 300.00)
ON CONFLICT (id_pemupukan) DO NOTHING;

-- 7. SEED RIWAYAT HAMA & PENYAKIT
INSERT INTO riwayat_hama_penyakit (id_insiden, id_lahan, tanggal_ditemukan, jenis_hama_penyakit, tingkat_serangan, tindakan_penanganan, status_penanganan)
VALUES 
    ('HMA-LHN01-01', 'LHN-GLD-001', '2026-07-10', 'Penggerek Buah Kopi (PBKo)', 'RINGAN', 'Pemetikan buah terinfeksi dan aplikasi agen hayati Beauveria bassiana', 'TERKENDALI')
ON CONFLICT (id_insiden) DO NOTHING;

-- 8. SEED RIWAYAT PANEN
INSERT INTO riwayat_panen (id_panen, id_lahan, tanggal_panen, berat_ceri_kg, metode_petik, varietas, status_alokasi)
VALUES 
    ('HVT-20261001-001', 'LHN-GLD-001', '2026-10-01', 350.00, 'PETIK_MERAH', 'ARABIKA', 'FULLY_BATCHED'),
    ('HVT-20261002-002', 'LHN-GLD-002', '2026-10-02', 500.00, 'PETIK_MERAH', 'ARABIKA', 'PARTIAL')
ON CONFLICT (id_panen) DO NOTHING;

-- 9. SEED BATCH PASCAPROSES
INSERT INTO batch_pascaproses (id_batch, kode_qr_trace, metode_proses, tanggal_mulai_olah, tanggal_selesai_olah, total_input_ceri_kg, berat_green_bean_kg, rendemen_persen, status_proses)
VALUES 
    ('BTC-GLD-202610-001', 'QR-LK-GLD-202610-WINE01', 'WINE', '2026-10-03', NULL, 600.00, NULL, NULL, 'FERMENTASI')
ON CONFLICT (id_batch) DO NOTHING;

-- 10. SEED BATCH PANEN MAPPING (Traceability Junction)
INSERT INTO batch_panen_mapping (id_mapping, id_batch, id_panen, berat_digunakan_kg)
VALUES 
    ('MAP-BTC01-HVT01', 'BTC-GLD-202610-001', 'HVT-20261001-001', 350.00),
    ('MAP-BTC01-HVT02', 'BTC-GLD-202610-001', 'HVT-20261002-002', 250.00)
ON CONFLICT (id_mapping) DO NOTHING;