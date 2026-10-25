"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  Droplets,
  Bug,
  MapPin,
  Trees,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { useLahanList } from "@/features/lahan/hooks/use-lahan-list";
import { SoilConditionTab } from "@/features/agronomi/components/soil-condition-tab";
import { FertilizationTab } from "@/features/agronomi/components/fertilization-tab";
import { PestDiseaseTab } from "@/features/agronomi/components/pest-disease-tab";

type ActiveTab = "tanah" | "pemupukan" | "hama";

export default function AgronomiPage() {
  const { data: lahanData, isLoading: isLoadingLahan } = useLahanList();
  const lahanList = useMemo(() => lahanData?.items ?? [], [lahanData]);

  const [selectedLandId, setSelectedLandId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("tanah");

  // Default select first land when loaded
  const currentLandId = useMemo(() => {
    if (selectedLandId && lahanList.some((l) => l.id_lahan === selectedLandId)) {
      return selectedLandId;
    }
    return lahanList[0]?.id_lahan ?? "";
  }, [selectedLandId, lahanList]);

  const currentLand = useMemo(
    () => lahanList.find((l) => l.id_lahan === currentLandId),
    [lahanList, currentLandId],
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight text-[#2A1810]">
          Agronomi & Monitoring Kebun
        </h1>
        <p className="mt-1 text-xs text-[#6E5D53]">
          Pengelolaan parameter tanah 6-in-1, riwayat siklus pemupukan berkala, dan mitigasi hama penyakit tanaman (Modul PRD M2).
        </p>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Petak Terpantau"
          value={lahanList.length}
          icon={MapPin}
          description="Total petak kebun dalam monitoring"
          isLoading={isLoadingLahan}
        />

        <KpiCard
          title="Rentang pH Ideal"
          value="5.5 - 6.5"
          icon={Activity}
          description="Rekomendasi pertumbuhan tanaman kopi"
        />

        <KpiCard
          title="Status Pemantauan"
          value="Aktif"
          icon={CheckCircle2}
          description="Siklus sampling berkala Desa Glodogan"
        />
      </div>

      {/* Land Selector Bar */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#2A1810]">
              <Trees className="h-5 w-5 text-[#8A7669]" />
            </div>
            <div>
              <label htmlFor="select-lahan" className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Pilih Petak Lahan untuk Monitoring
              </label>
              <div className="mt-0.5 flex items-center gap-2">
                <select
                  id="select-lahan"
                  value={currentLandId}
                  onChange={(e) => setSelectedLandId(e.target.value)}
                  className="rounded-lg bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-[#2A1810] outline-none transition-all hover:bg-[#F4F0EC] focus:ring-1 focus:ring-[#2A1810]"
                  disabled={isLoadingLahan || lahanList.length === 0}
                >
                  {lahanList.length === 0 && (
                    <option value="">Belum ada lahan terdaftar</option>
                  )}
                  {lahanList.map((l) => (
                    <option key={l.id_lahan} value={l.id_lahan}>
                      {l.nama_petak} ({l.dusun} • {l.petani?.nama_lengkap || "Petani"})
                    </option>
                  ))}
                </select>

                {currentLand && (
                  <span className="hidden text-xs text-[#8A7669] sm:inline">
                    {currentLand.elevasi_mdpl ? `${currentLand.elevasi_mdpl} mdpl` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {currentLand && (
            <a
              href={`/dashboard/lahan/${currentLand.id_lahan}`}
              className="flex items-center gap-1 text-xs font-semibold text-[#8A7669] transition-colors hover:text-[#2A1810]"
            >
              Lihat Detail Lahan 360°
              <ChevronRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Main Tabs Container */}
      {currentLandId ? (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-[#F4F0EC] pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("tanah")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                activeTab === "tanah"
                  ? "bg-[#2A1810] text-white shadow-xs"
                  : "bg-white text-[#6E5D53] hover:bg-[#FAF8F5] hover:text-[#2A1810]"
              }`}
            >
              <Activity className="h-4 w-4" />
              Parameter Tanah 6-in-1 (M2.1)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pemupukan")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                activeTab === "pemupukan"
                  ? "bg-[#2A1810] text-white shadow-xs"
                  : "bg-white text-[#6E5D53] hover:bg-[#FAF8F5] hover:text-[#2A1810]"
              }`}
            >
              <Droplets className="h-4 w-4" />
              Riwayat Pemupukan (M2.2)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("hama")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                activeTab === "hama"
                  ? "bg-[#2A1810] text-white shadow-xs"
                  : "bg-white text-[#6E5D53] hover:bg-[#FAF8F5] hover:text-[#2A1810]"
              }`}
            >
              <Bug className="h-4 w-4" />
              Hama & Penyakit (M2.3)
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === "tanah" && <SoilConditionTab landId={currentLandId} />}
          {activeTab === "pemupukan" && <FertilizationTab landId={currentLandId} />}
          {activeTab === "hama" && <PestDiseaseTab landId={currentLandId} />}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-12 text-center shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <Activity className="mx-auto h-10 w-10 text-[#8A7669]" />
          <h3 className="mt-3 font-heading text-sm font-bold text-[#2A1810]">
            Tidak Ada Lahan Terpilih
          </h3>
          <p className="mt-1 text-xs text-[#8A7669]">
            Silakan daftarkan lahan terlebih dahulu pada modul Pemetaan Lahan.
          </p>
        </div>
      )}
    </div>
  );
}
