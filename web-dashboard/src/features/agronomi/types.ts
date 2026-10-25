export type TahapPemantauan = "SEBELUM" | "SESUDAH";
export type TingkatSerangan = "RINGAN" | "SEDANG" | "BERAT";
export type StatusPenanganan = "TERDETEKSI" | "DALAM_PENANGANAN" | "TERKENDALI";

export interface SoilConditionLog {
  id_log_tanah: string;
  id_lahan: string;
  id_pemupukan?: string;
  tahap_pemantauan?: TahapPemantauan;
  tanggal_ukur: string;
  ph_tanah: number | null;
  kelembapan: number | null;
  suhu_celsius: number | null;
  n_value: number | null;
  p_value: number | null;
  k_value: number | null;
  ec_value: number | null;
  created_at?: string;
}

export interface CreateSoilConditionInput {
  tanggal_ukur: string;
  ph_tanah?: number | null;
  kelembapan?: number | null;
  suhu_celsius?: number | null;
  n_value?: number | null;
  p_value?: number | null;
  k_value?: number | null;
  ec_value?: number | null;
  id_pemupukan?: string;
  tahap_pemantauan?: TahapPemantauan;
}

export interface Fertilization {
  id_pemupukan: string;
  id_lahan: string;
  tanggal_aplikasi: string;
  jenis_pupuk: string;
  dosis_kg: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFertilizationInput {
  tanggal_aplikasi: string;
  jenis_pupuk: string;
  dosis_kg: number;
}

export interface TreatmentRecord {
  id_riwayat_penanganan: string;
  id_insiden: string;
  tanggal_penanganan: string;
  tindakan_penanganan: string;
  status_penanganan: StatusPenanganan;
  id_admin?: string;
  created_at?: string;
}

export interface PestDiseaseIncident {
  id_insiden: string;
  id_lahan: string;
  tanggal_ditemukan: string;
  jenis_hama_penyakit: string;
  tingkat_serangan: TingkatSerangan;
  status_penanganan: StatusPenanganan;
  penanganan_terakhir?: TreatmentRecord;
  nama_petak?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateIncidentInput {
  tanggal_ditemukan: string;
  jenis_hama_penyakit: string;
  tingkat_serangan: TingkatSerangan;
  tindakan_penanganan?: string;
  status_penanganan?: StatusPenanganan;
}

export interface AddTreatmentInput {
  tanggal_penanganan: string;
  tindakan_penanganan: string;
  status_penanganan: StatusPenanganan;
}

