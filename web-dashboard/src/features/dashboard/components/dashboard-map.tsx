"use client";

import { Fragment, useEffect, useMemo } from "react";
import {
  TileLayer,
  Polygon,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import { SafeMapContainer } from "@/components/ui/safe-map-container";
import { Sprout, Mountain, Scale, Trees } from "lucide-react";
import type { DashboardMapLand } from "@/features/dashboard/types";
import { MAP_COLORS } from "@/lib/map-colors";

interface DashboardMapProps {
  lands?: DashboardMapLand[];
}

const DEFAULT_CENTER: [number, number] = [-7.3308, 110.0055]; // Glodogan, Temanggung

function MapAutoBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 17 });
    }
  }, [points, map]);

  return null;
}

export default function DashboardMap({ lands = [] }: DashboardMapProps) {
  // Convert GeoJSON [lng, lat] coordinates to Leaflet [lat, lng]
  const renderedPolygons = useMemo(() => {
    return lands
      .filter((land) => land.polygon_geom?.coordinates?.[0]?.length)
      .map((land) => {
        const ring = land.polygon_geom!.coordinates[0];
        const positions: [number, number][] = ring.map(([lng, lat]) => [
          lat,
          lng,
        ]);
        return { land, positions };
      });
  }, [lands]);

  const allPoints = useMemo(() => {
    return renderedPolygons.flatMap((p) => p.positions);
  }, [renderedPolygons]);

  const initialCenter = useMemo<[number, number]>(() => {
    if (allPoints.length > 0) {
      return allPoints[0];
    }
    return DEFAULT_CENTER;
  }, [allPoints]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <SafeMapContainer
        center={initialCenter}
        zoom={15}
        minZoom={3}
        maxZoom={22}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={22}
          maxNativeZoom={19}
          attribution="Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
        />

        {allPoints.length > 0 && <MapAutoBounds points={allPoints} />}

        {renderedPolygons.map(({ land, positions }) => (
          <Fragment key={land.id_lahan}>
          <Polygon positions={positions} interactive={false} pathOptions={{ color: MAP_COLORS.surface, weight: 5, opacity: 0.85, fill: false }} />
          <Polygon
            positions={positions}
            pathOptions={{
              color: MAP_COLORS.primary,
              fillColor: MAP_COLORS.primary,
              fillOpacity: 0.25,
              weight: 2,
            }}
          >
            <Tooltip sticky direction="top">
              <span className="font-bold text-coffee-900">
                {land.nama_petak}
              </span>
              <br />
              <span className="text-xs text-text-muted">
                Petani: {land.nama_petani}
              </span>
            </Tooltip>

            <Popup>
              <div className="min-w-[190px] space-y-2 p-1">
                <div className="border-b border-border pb-1.5">
                  <span className="inline-block rounded bg-primary-tint px-2 py-0.5 text-[10px] font-bold text-text-muted">
                    {land.id_lahan}
                  </span>
                  <h3 className="mt-1 font-heading text-sm font-bold text-coffee-900">
                    {land.nama_petak}
                  </h3>
                  <p className="text-[11px] text-text-muted">{land.dusun}</p>
                </div>

                <div className="space-y-1.5 text-xs text-coffee-900">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-text-muted">
                      <Sprout className="h-3 w-3 text-coffee-900" />
                      Pemilik
                    </span>
                    <span className="font-semibold">{land.nama_petani}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-text-muted">
                      <Mountain className="h-3 w-3 text-coffee-900" />
                      Elevasi
                    </span>
                    <span className="font-semibold">
                      {land.elevasi_mdpl != null
                        ? `${land.elevasi_mdpl} mdpl`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-text-muted">
                      <Scale className="h-3 w-3 text-coffee-900" />
                      Luas Lahan
                    </span>
                    <span className="font-semibold">
                      {land.luas_m2 != null
                        ? `${(land.luas_m2 / 10000).toFixed(2)} Ha`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-text-muted">
                      <Trees className="h-3 w-3 text-coffee-900" />
                      Populasi Pohon
                    </span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("id-ID").format(land.total_pohon)}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Polygon>
          </Fragment>
        ))}
      </SafeMapContainer>
    </div>
  );
}
