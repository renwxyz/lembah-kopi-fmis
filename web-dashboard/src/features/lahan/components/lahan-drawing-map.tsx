"use client";

import { useEffect, useMemo } from "react";
import {
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Undo2, Trash2, MapPin, Plus, Minus } from "lucide-react";
import { SafeMapContainer } from "@/components/ui/safe-map-container";
import { Button } from "@/components/ui/button";
import { geoJsonPolygonToLatLngs } from "@/lib/gis";
import type { Lahan } from "../types";

const DEFAULT_CENTER: [number, number] = [-7.3308, 110.0055]; // Glodogan, Temanggung

interface MapClickHandlerProps {
  onAddPoint: (point: [number, number]) => void;
  disabled?: boolean;
}

function MapClickHandler({ onAddPoint, disabled }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onAddPoint([
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6)),
      ]);
    },
  });

  return null;
}

function MapBoundsController({
  points,
  initialPoints,
}: {
  points: [number, number][];
  initialPoints: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const targetPoints = initialPoints.length > 0 ? initialPoints : points;
    if (targetPoints.length > 0) {
      map.fitBounds(targetPoints, { padding: [50, 50], maxZoom: 18 });
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function MapZoomControls() {
  const map = useMap();

  return (
    <div className="absolute top-16 right-3.5 z-[1000] flex flex-col rounded-lg bg-white/95 shadow-md backdrop-blur border border-black/[0.06] overflow-hidden pointer-events-auto">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomIn();
        }}
        aria-label="Perbesar peta"
        className="flex h-8 w-8 items-center justify-center text-[#2A1810] hover:bg-stone-100 transition-colors"
        title="Perbesar peta"
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className="h-px bg-stone-200" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomOut();
        }}
        aria-label="Perkecil peta"
        className="flex h-8 w-8 items-center justify-center text-[#2A1810] hover:bg-stone-100 transition-colors"
        title="Perkecil peta"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}

export interface LahanDrawingMapProps {
  points: [number, number][];
  onChangePoints: (points: [number, number][]) => void;
  otherLands?: Lahan[];
  disabled?: boolean;
}

export default function LahanDrawingMap({
  points,
  onChangePoints,
  otherLands = [],
  disabled = false,
}: LahanDrawingMapProps) {
  const initialCenter = useMemo<[number, number]>(() => {
    if (points.length > 0) return points[0];
    const firstOther = otherLands.find((l) => l.latitude != null && l.longitude != null);
    if (firstOther && firstOther.latitude != null && firstOther.longitude != null) {
      return [firstOther.latitude, firstOther.longitude];
    }
    return DEFAULT_CENTER;
  }, [points, otherLands]);

  const handleAddPoint = (point: [number, number]) => {
    onChangePoints([...points, point]);
  };

  const handleUndo = () => {
    if (points.length === 0) return;
    onChangePoints(points.slice(0, -1));
  };

  const handleClear = () => {
    onChangePoints([]);
  };

  const handleRemovePoint = (indexToRemove: number) => {
    onChangePoints(points.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-stone-100 rounded-none [&_.leaflet-container]:!rounded-none">
      <SafeMapContainer
        center={initialCenter}
        zoom={16}
        minZoom={3}
        maxZoom={22}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full !rounded-none"
      >
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={22}
          maxNativeZoom={19}
        />

        <MapClickHandler onAddPoint={handleAddPoint} disabled={disabled} />
        <MapBoundsController points={points} initialPoints={points} />
        <MapZoomControls />

        {/* Poligon Lahan Lain Sekitar (Passive Reference) */}
        {otherLands.map((land) => {
          if (!land.polygon_geom) return null;
          const neighborCoords = geoJsonPolygonToLatLngs(land.polygon_geom);
          if (neighborCoords.length < 3) return null;

          return (
            <Polygon
              key={land.id_lahan}
              positions={neighborCoords}
              pathOptions={{
                color: "#64748b",
                fillColor: "#94a3b8",
                fillOpacity: 0.25,
                weight: 1.5,
                dashArray: "4 4",
              }}
            >
              <Tooltip sticky direction="top">
                <span className="font-semibold text-xs">{land.nama_petak}</span>
                <br />
                <span className="text-[10px] text-muted-foreground">
                  {land.dusun}
                </span>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Garis / Poligon Aktif yang Sedang Diplot */}
        {points.length >= 3 ? (
          <Polygon
            positions={points}
            pathOptions={{
              color: "#16a34a",
              fillColor: "#22c55e",
              fillOpacity: 0.35,
              weight: 2.5,
            }}
          />
        ) : points.length === 2 ? (
          <Polyline
            positions={points}
            pathOptions={{
              color: "#16a34a",
              weight: 2.5,
              dashArray: "6 6",
            }}
          />
        ) : null}

        {/* Vertex Markers (Titik Sudut Aktif) */}
        {points.map((point, index) => (
          <CircleMarker
            key={`${point[0]}-${point[1]}-${index}`}
            center={point}
            radius={index === 0 ? 7 : 5}
            pathOptions={{
              color: index === 0 ? "#15803d" : "#16a34a",
              fillColor: index === 0 ? "#bbf7d0" : "#ffffff",
              fillOpacity: 1,
              weight: 2.5,
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation();
                handleRemovePoint(index);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <span className="text-[11px] font-bold">
                Titik {index + 1} {index === 0 ? "(Awal)" : ""}
              </span>
              <br />
              <span className="text-[10px] text-red-600">Klik untuk hapus</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </SafeMapContainer>

      {/* Floating Toolbar Kontrol Plotting */}
      <div className="absolute top-3.5 left-3.5 z-[1000] flex items-center gap-2">
        <span className="rounded-lg bg-[#2A1810]/85 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
          {points.length} Titik Sudut
        </span>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleUndo}
          disabled={points.length === 0 || disabled}
          className="h-8 gap-1.5 rounded-lg border-0 bg-white/95 px-3 text-xs font-semibold text-[#2A1810] shadow-sm backdrop-blur-md hover:bg-white"
          title="Batalkan titik terakhir"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleClear}
          disabled={points.length === 0 || disabled}
          className="h-8 gap-1.5 rounded-lg border-0 bg-white/95 px-3 text-xs font-semibold text-red-600 shadow-sm backdrop-blur-md hover:bg-red-50"
          title="Kosongkan seluruh titik"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Petunjuk Penggunaan di Kiri Bawah Peta (Bebas tabrakan dengan watermark) */}
      <div className="absolute bottom-3.5 left-4 z-[1000] pointer-events-none max-w-sm sm:max-w-md">
        <div className="inline-flex items-center gap-2 rounded-lg bg-[#2A1810]/85 px-3.5 py-2 text-xs font-medium text-white/95 shadow-md backdrop-blur-md">
          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>
            {points.length === 0
              ? "Klik di peta satelit untuk mulai meletakkan titik sudut batas kebun."
              : points.length < 3
                ? `Tambahkan minimal ${3 - points.length} titik lagi untuk membentuk batas poligon tertutup.`
                : "Batas poligon terbentuk. Klik pada titik manapun untuk menghapusnya."}
          </span>
        </div>
      </div>

      {/* Watermark Atribusi di Kanan Bawah */}
      <div className="absolute bottom-3.5 right-4 z-[1000] pointer-events-none rounded bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-sm">
        Esri World Imagery
      </div>
    </div>
  );
}

