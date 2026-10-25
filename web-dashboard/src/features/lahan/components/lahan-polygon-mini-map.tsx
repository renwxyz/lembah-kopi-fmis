"use client";

import { useMemo } from "react";
import { Polygon, CircleMarker, Tooltip, TileLayer } from "react-leaflet";
import { MapPin } from "lucide-react";
import { SafeMapContainer } from "@/components/ui/safe-map-container";
import { geoJsonPolygonToLatLngs, calculatePolygonCentroid } from "@/lib/gis";
import type { Lahan } from "../types";

export interface LahanPolygonMiniMapProps {
  lahan: Lahan;
}

export default function LahanPolygonMiniMap({ lahan }: LahanPolygonMiniMapProps) {
  const polygonCoords = useMemo(() => {
    if (!lahan.polygon_geom) return [];
    return geoJsonPolygonToLatLngs(lahan.polygon_geom);
  }, [lahan.polygon_geom]);

  const centroid = useMemo(() => {
    if (polygonCoords.length >= 3) {
      const calculated = calculatePolygonCentroid(polygonCoords);
      if (calculated) return calculated;
    }
    if (lahan.latitude != null && lahan.longitude != null) {
      return [lahan.latitude, lahan.longitude] as [number, number];
    }
    return [-7.3308, 110.0055] as [number, number];
  }, [polygonCoords, lahan.latitude, lahan.longitude]);

  return (
    <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl bg-stone-100 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] [&_.leaflet-container]:!rounded-none">
      <SafeMapContainer
        center={centroid}
        zoom={17}
        minZoom={4}
        maxZoom={22}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full !rounded-none"
      >
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={22}
          maxNativeZoom={19}
        />

        {polygonCoords.length >= 3 && (
          <Polygon
            positions={polygonCoords}
            pathOptions={{
              color: "#16a34a",
              fillColor: "#22c55e",
              fillOpacity: 0.35,
              weight: 2.5,
            }}
          >
            <Tooltip sticky direction="top">
              <span className="font-semibold text-xs">{lahan.nama_petak}</span>
              <br />
              <span className="text-[10px] text-muted-foreground">{lahan.dusun}</span>
            </Tooltip>
          </Polygon>
        )}

        <CircleMarker
          center={centroid}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#16a34a",
            fillOpacity: 1,
            weight: 2.5,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            <span className="text-xs font-semibold">Titik Centroid Lahan</span>
          </Tooltip>
        </CircleMarker>
      </SafeMapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 rounded-lg bg-[#2A1810]/85 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-md">
        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
        <span>
          {polygonCoords.length >= 3
            ? "Batas Polygon Terplot"
            : "Titik Koordinat Dasar (Belum Diplot Polygon)"}
        </span>
      </div>

      <div className="absolute bottom-2.5 right-3 z-[1000] pointer-events-none rounded bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-sm">
        Esri World Imagery
      </div>
    </div>
  );
}

