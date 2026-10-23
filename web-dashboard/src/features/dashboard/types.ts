import type { GeoJsonPolygon } from "../lahan/types";

export interface DashboardSummary {
  total_petani: number;
  total_luas_m2: number;
  panen_bulan_ini_kg: number;
  total_batch_aktif: number;
}

export interface DashboardMapLand {
  id_lahan: string;
  nama_petak: string;
  id_petani: string;
  nama_petani: string;
  dusun: string;
  elevasi_mdpl?: number | null;
  luas_m2?: number | null;
  total_pohon: number;
  polygon_geom?: GeoJsonPolygon | null;
}

export interface DashboardBatch {
  id_batch: string;
  kode_qr_trace: string;
  metode_proses: string;
  total_input_ceri_kg: number;
  status_proses: string;
  estimasi_tanggal_selesai?: string | null;
}

export interface DashboardFarmAlert {
  id_insiden: string;
  id_lahan: string;
  nama_petak: string;
  jenis_hama_penyakit: string;
  tingkat_serangan: "RINGAN" | "SEDANG" | "BERAT" | string;
  status_penanganan: "TERDETEKSI" | "DALAM_PENANGANAN" | "TERKENDALI" | string;
  tanggal_ditemukan: string;
}

export interface DashboardHarvest {
  id_panen: string;
  tanggal_panen: string;
  nama_petani: string;
  nama_petak: string;
  varietas: string;
  berat_ceri_kg: number;
  status_alokasi: "UNPROCESSED" | "PARTIAL" | "FULLY_BATCHED" | string;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  map_lahan: DashboardMapLand[];
  batch_aktif: DashboardBatch[];
  peringatan_kebun: DashboardFarmAlert[];
  panen_terbaru: DashboardHarvest[];
}

