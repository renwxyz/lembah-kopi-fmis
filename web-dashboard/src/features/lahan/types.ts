export interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface Lahan {
  id_lahan: string;
  id_petani: string;
  nama_petak: string;
  dusun: string;
  elevasi_mdpl: number | null;
  latitude: number | null;
  longitude: number | null;
  polygon_geom: GeoJsonPolygon | null;
  luas_m2: number | null;
  total_pohon?: number | null;
  petani?: {
    id_petani: string;
    nama_lengkap: string;
    no_hp?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export type CoffeeVariety = "ROBUSTA" | "ARABIKA";
export type PlantAgeGroup =
  | "LIMA_TAHUN_KURANG"
  | "LIMA_BELAS_TAHUN_KURANG"
  | "LIMA_BELAS_TAHUN_LEBIH";

export interface CropInventory {
  id_inventaris: string;
  id_lahan: string;
  varietas: CoffeeVariety;
  kelompok_usia: PlantAgeGroup;
  created_at?: string;
  updated_at?: string;
}

export interface TreePopulationItem {
  id_inventaris: string;
  varietas: CoffeeVariety;
  kelompok_usia: PlantAgeGroup;
  jumlah_pohon: number;
}

export interface TreePopulationSummary {
  id_lahan: string;
  total_pohon: number;
  blok: TreePopulationItem[];
}

export interface CreateInventoryInput {
  varietas: CoffeeVariety;
  kelompok_usia: PlantAgeGroup;
  jumlah_pohon?: number;
}

export interface LahanPage {
  items: Lahan[];
  total: number;
  page: number;
  page_size: number;
}

export interface GetLahanParams {
  search?: string;
  farmerId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateLahanInput {
  id_petani: string;
  nama_petak: string;
  dusun: string;
  elevasi_mdpl?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}
