/**
 * Warna peta Leaflet. Atribut SVG milik Leaflet tidak bisa membaca CSS variable,
 * jadi nilai token DESIGN.md bagian 3.1 dan 7.2 disalin di sini. Ubah di sini bila token berubah.
 */
export const MAP_COLORS = {
  /** token primary */
  primary: "#51613A",
  /** token coffee-900, untuk poligon terpilih */
  selected: "#2A1810",
  /** token primary-tint */
  tint: "#EEF1E6",
  /** token surface */
  surface: "#FFFFFF",
  /** token text-muted, untuk lahan tetangga */
  neighbor: "#6B5F58",
} as const;
