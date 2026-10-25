import type { CoffeeVariety, PlantAgeGroup } from "@/features/lahan/types";
import type { HarvestLog } from "@/features/panen/types";

export type ProcessingStatus =
  | "FERMENTASI"
  | "PENGERINGAN"
  | "HULLING_RESTING"
  | "SELESAI";

export interface ProcessingMethod {
  kode_metode: string;
  nama_metode: string;
  deskripsi?: string | null;
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessingBatch {
  id_batch: string;
  kode_qr_trace: string;
  metode_proses: string;
  tanggal_mulai_olah: string;
  estimasi_tanggal_selesai?: string | null;
  tanggal_selesai_olah?: string | null;
  target_kadar_air_persen?: number | null;
  total_input_ceri_kg: number;
  berat_green_bean_kg?: number | null;
  rendemen_persen?: number | null;
  status_proses: ProcessingStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessingBatchListResponse {
  items: ProcessingBatch[];
  total: number;
  page: number;
  page_size: number;
}

export interface BatchFilter {
  status_proses?: ProcessingStatus | "";
  metode_proses?: string;
  page?: number;
  page_size?: number;
}

export interface CreateBatchInput {
  metode_proses: string;
  tanggal_mulai_olah: string;
  estimasi_tanggal_selesai?: string;
  target_kadar_air_persen?: number;
}

export interface UpdateBatchInput {
  metode_proses: string;
  tanggal_mulai_olah: string;
  estimasi_tanggal_selesai?: string | null;
  target_kadar_air_persen?: number | null;
  berat_green_bean_kg?: number | null;
}

export interface ProcessingStageRecord {
  id_riwayat_tahap: string;
  id_batch: string;
  status_proses: ProcessingStatus;
  tanggal_perubahan: string;
  kadar_air_persen?: number | null;
  catatan?: string | null;
  id_admin?: string | null;
  created_at: string;
}

export interface AddStageInput {
  status_proses: ProcessingStatus;
  tanggal_perubahan?: string;
  kadar_air_persen?: number;
  catatan?: string;
}

export interface BatchPanenMapping {
  id_mapping: string;
  id_batch: string;
  id_panen: string;
  berat_digunakan_kg: number;
  created_at?: string;
}

export interface AddMappingInput {
  id_panen: string;
  berat_digunakan_kg: number;
}

export interface UpdateMappingInput {
  berat_digunakan_kg: number;
}

export interface SoilConditionMini {
  id_log_tanah: string;
  tanggal_ukur: string;
  ph_tanah: number;
  kelembapan: number;
  suhu_celsius?: number;
  ec_value?: number;
}

export interface BatchTraceOrigin {
  alokasi: BatchPanenMapping;
  panen: HarvestLog;
  lahan: {
    id_lahan: string;
    id_petani: string;
    nama_petak: string;
    dusun: string;
    elevasi_mdpl?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    luas_m2?: number | null;
  };
  petani: {
    id_petani: string;
    nama_lengkap: string;
    no_hp?: string;
  };
  inventaris?: {
    id_inventaris: string;
    id_lahan: string;
    varietas: CoffeeVariety;
    jumlah_pohon: number;
    kelompok_usia: PlantAgeGroup;
  } | null;
  histori_kondisi_tanah?: SoilConditionMini[];
}

export interface BatchTraceability {
  batch: ProcessingBatch;
  asal_panen: BatchTraceOrigin[];
}

