import type { PaginatedData } from "@/types/api";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "CHANGE_PASSWORD"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED";

export interface AuditLog {
  id_audit: number;
  waktu: string;
  id_admin: string | null;
  username: string;
  peran: string | null;
  aksi: AuditAction;
  resource: string;
  resource_id: string | null;
  metode: string;
  path: string;
  status_code: number;
  request_id: string | null;
  ip_address: string | null;
}

export type AuditLogPage = PaginatedData<AuditLog>;

export interface AuditLogFilters {
  q?: string;
  username?: string;
  aksi?: AuditAction | "";
  resource?: string;
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Tambah",
  UPDATE: "Ubah",
  DELETE: "Hapus",
  CHANGE_PASSWORD: "Ganti Kata Sandi",
  LOGIN_SUCCESS: "Login Berhasil",
  LOGIN_FAILED: "Login Gagal",
};

export const AUDIT_RESOURCE_OPTIONS = [
  { value: "petani", label: "Petani" },
  { value: "lahan", label: "Lahan" },
  { value: "inventaris", label: "Inventaris Tanaman" },
  { value: "panen", label: "Panen" },
  { value: "batch", label: "Batch Pascaproses" },
  { value: "pemupukan", label: "Pemupukan" },
  { value: "hama-penyakit", label: "Hama & Penyakit" },
  { value: "metode-pascaproses", label: "Metode Pascaproses" },
  { value: "admin", label: "Admin" },
  { value: "auth", label: "Autentikasi" },
] as const;

