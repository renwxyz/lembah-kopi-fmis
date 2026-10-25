import type { GeoJsonPolygon } from "@/features/lahan/types";

/**
 * Konversi array Leaflet [lat, lng] menjadi GeoJSON Polygon [lng, lat].
 * Menjamin ring tertutup (titik awal == titik akhir).
 */
export function latLngsToGeoJsonPolygon(points: [number, number][]): GeoJsonPolygon {
  if (points.length < 3) {
    throw new Error("Polygon membutuhkan minimal 3 titik koordinat.");
  }

  const coordinates: [number, number][] = points.map(([lat, lng]) => [lng, lat]);

  // Pastikan titik pertama dan terakhir identik (closed ring)
  const [firstLng, firstLat] = coordinates[0];
  const [lastLng, lastLat] = coordinates[coordinates.length - 1];

  if (firstLng !== lastLng || firstLat !== lastLat) {
    coordinates.push([firstLng, firstLat]);
  }

  return {
    type: "Polygon",
    coordinates: [coordinates],
  };
}

/**
 * Konversi GeoJSON Polygon menjadi array Leaflet [lat, lng].
 * Menghapus titik penutup duplikat di akhir.
 */
export function geoJsonPolygonToLatLngs(
  polygon: GeoJsonPolygon | null | undefined,
): [number, number][] {
  if (!polygon?.coordinates?.[0]?.length) return [];

  const ring = polygon.coordinates[0];
  const points: [number, number][] = ring.map(([lng, lat]) => [lat, lng]);

  if (
    points.length > 1 &&
    points[0][0] === points[points.length - 1][0] &&
    points[0][1] === points[points.length - 1][1]
  ) {
    points.pop();
  }

  return points;
}

/**
 * Menghitung luas area polygon geodesik (dalam m²) menggunakan formula Spherical Excess.
 * Mengacu pada model bola bumi WGS-84 (R = 6.378.137m) selaras dengan PostGIS ST_Area(geography).
 */
export function calculatePolygonAreaM2(points: [number, number][]): number {
  if (points.length < 3) return 0;

  const R = 6378137; // radius bumi dalam meter
  const rad = (deg: number) => (deg * Math.PI) / 180;
  let total = 0;

  for (let i = 0; i < points.length; i++) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[(i + 1) % points.length];

    total += rad(lng2 - lng1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }

  return Math.abs((total * R * R) / 4);
}

/**
 * Menghitung titik tengah (centroid rata-rata) dari sekumpulan titik [lat, lng].
 */
export function calculatePolygonCentroid(
  points: [number, number][],
): [number, number] | null {
  if (points.length === 0) return null;

  const sum = points.reduce(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0],
  );

  return [
    Number((sum[0] / points.length).toFixed(6)),
    Number((sum[1] / points.length).toFixed(6)),
  ];
}

/**
 * Memeriksa apakah segmen garis saling bersilangan (self-intersection test).
 */
export function isPolygonSelfIntersecting(points: [number, number][]): boolean {
  if (points.length < 4) return false;

  const ccw = (a: [number, number], b: [number, number], c: [number, number]) => {
    return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  };

  const linesIntersect = (
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    p4: [number, number],
  ) => {
    return (
      ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
    );
  };

  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a1 = points[i];
    const a2 = points[(i + 1) % n];

    for (let j = i + 1; j < n; j++) {
      // Abaikan segmen yang bertetangga karena mereka berbagi vertex
      if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue;

      const b1 = points[j];
      const b2 = points[(j + 1) % n];

      if (linesIntersect(a1, a2, b1, b2)) {
        return true;
      }
    }
  }

  return false;
}

