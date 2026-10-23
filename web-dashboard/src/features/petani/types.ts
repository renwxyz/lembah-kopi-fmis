export interface Farmer {
  id_petani: string;
  nama_lengkap: string;
  no_hp: string;
  created_at?: string;
  updated_at?: string;
}

export interface FarmerPage {
  items: Farmer[];
  total: number;
  page: number;
  page_size: number;
}

