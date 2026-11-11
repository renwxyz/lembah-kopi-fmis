"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Trees,
  Activity,
  Droplets,
  Bug,
  Wheat,
  MapPin,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLahanDetail } from "@/features/lahan/hooks/use-lahan-list";
import { LahanHeroCard } from "@/features/lahan/components/lahan-hero-card";
import { InventarisTanamanTab } from "@/features/lahan/components/inventaris-tanaman-tab";
import { CreateLahanDialog } from "@/features/lahan/components/create-lahan-dialog";
import { SoilConditionTab } from "@/features/agronomi/components/soil-condition-tab";
import { FertilizationTab } from "@/features/agronomi/components/fertilization-tab";
import { PestDiseaseTab } from "@/features/agronomi/components/pest-disease-tab";
import { HarvestTab } from "@/features/panen/components/harvest-tab";

const LahanPolygonMiniMap = dynamic(
  () => import("@/features/lahan/components/lahan-polygon-mini-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 sm:h-72 w-full items-center justify-center rounded-xl bg-cream-50">
        <span className="text-xs text-text-muted">Memuat peta spasial kebun...</span>
      </div>
    ),
  },
);

type TabKey = "inventaris" | "tanah" | "pemupukan" | "hama" | "panen";

interface LahanDetailContentProps {
  id: string;
}

export function LahanDetailContent({ id }: LahanDetailContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("inventaris");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: lahan, isLoading, isError, refetch } = useLahanDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <LoaderCircle className="h-8 w-8 animate-spin text-coffee-900" />
        <p className="text-xs text-text-muted">Memuat profil lengkap lahan...</p>
      </div>
    );
  }

  if (isError || !lahan) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-danger" />
        <h2 className="font-heading text-base font-bold text-coffee-900">
          Lahan Tidak Ditemukan
        </h2>
        <p className="text-xs text-text-muted max-w-sm">
          Data petak lahan dengan ID ini tidak tersedia atau telah dihapus dari sistem.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} className="h-8 text-xs">
            Coba Lagi
          </Button>
          <Link href="/dashboard/lahan">
            <Button className="h-8 text-xs bg-primary text-white">
              Kembali ke Daftar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <LahanHeroCard lahan={lahan} onEdit={() => setIsEditDialogOpen(true)} />

      {/* Main Grid: Content & MiniMap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tabs & Tab Panels (~67% desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation Pill Header */}
          <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("inventaris")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                activeTab === "inventaris"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface text-text-muted hover:bg-cream-50 hover:text-coffee-900"
              }`}
            >
              <Trees className="h-4 w-4" />
              Inventaris Tanaman (M1.3)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tanah")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                activeTab === "tanah"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface text-text-muted hover:bg-cream-50 hover:text-coffee-900"
              }`}
            >
              <Activity className="h-4 w-4" />
              Kondisi Tanah (M2.1)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pemupukan")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                activeTab === "pemupukan"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface text-text-muted hover:bg-cream-50 hover:text-coffee-900"
              }`}
            >
              <Droplets className="h-4 w-4" />
              Pemupukan (M2.2)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("hama")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                activeTab === "hama"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface text-text-muted hover:bg-cream-50 hover:text-coffee-900"
              }`}
            >
              <Bug className="h-4 w-4" />
              Hama & Penyakit (M2.3)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("panen")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                activeTab === "panen"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface text-text-muted hover:bg-cream-50 hover:text-coffee-900"
              }`}
            >
              <Wheat className="h-4 w-4" />
              Riwayat Panen (M3.1)
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === "inventaris" && (
            <InventarisTanamanTab landId={lahan.id_lahan} />
          )}

          {activeTab === "tanah" && (
            <SoilConditionTab landId={lahan.id_lahan} />
          )}

          {activeTab === "pemupukan" && (
            <FertilizationTab landId={lahan.id_lahan} />
          )}

          {activeTab === "hama" && (
            <PestDiseaseTab landId={lahan.id_lahan} />
          )}

          {activeTab === "panen" && (
            <HarvestTab landId={lahan.id_lahan} />
          )}
        </div>

        {/* Right Column: MiniMap & Geospasial Overview (~33% desktop) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-coffee-900 block">
              Peta Batas Geospasial Lahan
            </span>
            <LahanPolygonMiniMap lahan={lahan} />
          </div>

          <div className="rounded-xl bg-surface p-5 border border-border space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
              Koordinat GPS & Lokasi
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-text-muted">Titik Centroid</span>
                <span className="font-mono font-medium text-coffee-900">
                  {lahan.latitude && lahan.longitude
                    ? `${lahan.latitude.toFixed(5)}, ${lahan.longitude.toFixed(5)}`
                    : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-text-muted">Dusun</span>
                <span className="font-medium text-coffee-900">{lahan.dusun}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-text-muted">Ketinggian</span>
                <span className="font-medium text-coffee-900">
                  {lahan.elevasi_mdpl ? `${lahan.elevasi_mdpl} mdpl` : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Status Polygon</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    lahan.polygon_geom
                      ? "text-success-ink"
                      : "text-warning-ink"
                  }`}
                >
                  <MapPin className="h-3 w-3" />
                  {lahan.polygon_geom ? "Terpetakan" : "Belum diplot"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Lahan Dialog */}
      <CreateLahanDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        initialLahan={lahan}
      />
    </div>
  );
}

