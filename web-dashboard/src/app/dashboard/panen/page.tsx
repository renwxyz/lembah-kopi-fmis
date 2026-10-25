"use client";

import { useState, useMemo } from "react";
import {
  Wheat,
  Sparkles,
  MapPin,
  ChevronRight,
  Layers,
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { useLahanList } from "@/features/lahan/hooks/use-lahan-list";
import { HarvestTab } from "@/features/panen/components/harvest-tab";

export default function PanenPage() {
  const { data: lahanData, isLoading: isLoadingLahan } = useLahanList();
  const lahanList = useMemo(() => lahanData?.items ?? [], [lahanData]);

  const [selectedLandId, setSelectedLandId] = useState<string>("");

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
          Pencatatan Hasil Panen Ceri Kopi
        </h1>
        <p className="mt-1 text-xs text-[#6E5D53]">
          Pendataan penerimaan ceri kopi harian, klasifikasi pemetikan merah murni vs. pelangi, dan pelacakan alokasi ke batch pascaproses (Sub-Modul PRD M3.1).
        </p>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Petak Lahan Panen"
          value={lahanList.length}
          icon={MapPin}
          description="Total petak terdata dalam panen"
          isLoading={isLoadingLahan}
        />

        <KpiCard
          title="Standar Mutu"
          value="Petik Merah"
          icon={Sparkles}
          description="Optimalisasi ceri brix tinggi"
        />

        <KpiCard
          title="Tracking Batch"
          value="Aktif"
          icon={Layers}
          description="Terhubung ke modul pascaproses"
        />
      </div>

      {/* Land Selector Bar */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#2A1810]">
              <Wheat className="h-5 w-5 text-[#8A7669]" />
            </div>
            <div>
              <label htmlFor="select-panen-lahan" className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Pilih Lahan Panen
              </label>
              <div className="mt-0.5 flex items-center gap-2">
                <select
                  id="select-panen-lahan"
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

      {/* Main Harvest Tab Content */}
      {currentLandId ? (
        <HarvestTab landId={currentLandId} />
      ) : (
        <div className="rounded-2xl bg-white p-12 text-center shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <Wheat className="mx-auto h-10 w-10 text-[#8A7669]" />
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
