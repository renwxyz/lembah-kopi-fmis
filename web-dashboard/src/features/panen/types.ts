import type { CoffeeVariety } from "@/features/lahan/types";

export type PickingMethod = "PETIK_MERAH" | "PETIK_PELANGI";
export type AllocationStatus = "UNPROCESSED" | "PARTIAL" | "FULLY_BATCHED";

export interface HarvestLog {
  id_panen: string;
  id_lahan: string;
  id_inventaris?: string | null;
  tanggal_panen: string;
  berat_ceri_kg: number;
  metode_petik: PickingMethod;
  varietas: CoffeeVariety;
  status_alokasi: AllocationStatus;
  created_at?: string;
  updated_at?: string;
}

export interface HarvestFilter {
  dari?: string;
  sampai?: string;
  varietas?: CoffeeVariety | "";
  status_alokasi?: AllocationStatus | "";
  page?: number;
  page_size?: number;
}

export interface HarvestListResponse {
  items: HarvestLog[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateHarvestInput {
  id_inventaris?: string;
  tanggal_panen: string;
  berat_ceri_kg: number;
  metode_petik: PickingMethod;
}

export interface UpdateHarvestInput {
  tanggal_panen: string;
  berat_ceri_kg: number;
  metode_petik: PickingMethod;
}

