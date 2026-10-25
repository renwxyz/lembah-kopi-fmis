export interface CommunityValue {
  judul: string;
  deskripsi: string;
}

export interface SiteSettings {
  hero_judul: string;
  hero_slogan: string;
  hero_foto_key?: string;
  hero_foto_url?: string;
  nomor_whatsapp: string;
  about_cerita: string;
  about_nilai: CommunityValue[];
  alamat: string;
  instagram_url: string;
  youtube_url: string;
  facebook_url: string;
  tiktok_url: string;
  updated_at?: string;
}

export interface CoffeeProduct {
  id_produk: string;
  nama: string;
  varietas: "ARABIKA" | "ROBUSTA" | "LIBERIKA" | "EXCELSA";
  proses: "NATURAL" | "HONEY" | "FULL_WASHED" | "SEMI_WASHED" | "WET_HULLED";
  foto_key?: string;
  foto_url?: string;
  status_ketersediaan: "TERSEDIA" | "TERBATAS" | "HABIS";
  created_at?: string;
  updated_at?: string;
}

export interface MediaEmbed {
  id_media: string;
  tipe: "YOUTUBE" | "INSTAGRAM";
  url: string;
  external_id: string;
  embed_url: string;
  tampil: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Agenda {
  id_agenda: string;
  judul: string;
  tanggal: string;
  keterangan: string;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryPhoto {
  id_foto: string;
  foto_key: string;
  foto_url?: string;
  keterangan: string;
  urutan: number;
  created_at?: string;
  updated_at?: string;
}

export interface PublicHomeData {
  pengaturan: SiteSettings;
  produk: CoffeeProduct[];
  media: MediaEmbed[];
  agenda: Agenda[];
  galeri: GalleryPhoto[];
}

