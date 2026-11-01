"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Wheat,
  QrCode,
  ArrowLeft,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatNumber } from "@/lib/format";
import { ApiError } from "@/lib/api-error";
import { useBatchDetail, useUpdateBatch } from "@/features/batch/hooks/use-batch";
import { BatchStageTimeline } from "@/features/batch/components/batch-stage-timeline";
import { BatchPanenAllocationModal } from "@/features/batch/components/batch-panen-allocation-modal";
import { BatchTraceabilityCard } from "@/features/batch/components/batch-traceability-card";
import type { UpdateBatchInput } from "@/features/batch/types";

interface BatchDetailContentProps {
  id: string;
}

type TabKey = "stages" | "allocation" | "traceability";

export function BatchDetailContent({ id }: BatchDetailContentProps) {
  const { data: batch, isLoading, isError } = useBatchDetail(id);
  const updateMutation = useUpdateBatch(id);

  const [activeTab, setActiveTab] = useState<TabKey>("stages");
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isEditYieldModalOpen, setIsEditYieldModalOpen] = useState(false);

  // Form State for updating yield & output
  const [greenBeanInput, setGreenBeanInput] = useState("");
  const [yieldError, setYieldError] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#8A7669]" />
        <span className="ml-2 text-xs text-[#8A7669]">Memuat data batch pascaproses...</span>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-10 w-10 text-amber-600" />
        <h2 className="mt-3 font-heading text-base font-bold text-[#2A1810]">
          Batch Tidak Ditemukan
        </h2>
        <p className="mt-1 text-xs text-[#8A7669]">
          Data batch pascaproses dengan ID &quot;{id}&quot; tidak ditemukan di server.
        </p>
        <Link
          href="/dashboard/batch"
          className="mt-4 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white"
        >
          Kembali ke Daftar Batch
        </Link>
      </div>
    );
  }

  const openYieldModal = () => {
    setGreenBeanInput(
      batch.berat_green_bean_kg ? String(batch.berat_green_bean_kg) : "",
    );
    setYieldError("");
    setIsEditYieldModalOpen(true);
  };

  const handleSaveYield = async (e: React.FormEvent) => {
    e.preventDefault();
    setYieldError("");

    const weightNum = greenBeanInput ? parseFloat(greenBeanInput) : null;
    if (weightNum !== null && (isNaN(weightNum) || weightNum <= 0)) {
      setYieldError("Berat green bean harus angka positif.");
      return;
    }

    try {
      const input: UpdateBatchInput = {
        metode_proses: batch.metode_proses,
        tanggal_mulai_olah: batch.tanggal_mulai_olah.slice(0, 10),
        estimasi_tanggal_selesai: batch.estimasi_tanggal_selesai
          ? batch.estimasi_tanggal_selesai.slice(0, 10)
          : null,
        target_kadar_air_persen: batch.target_kadar_air_persen || null,
        berat_green_bean_kg: weightNum,
      };

      await updateMutation.mutateAsync(input);
      setIsEditYieldModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setYieldError(err.message);
      } else {
        setYieldError("Gagal memperbarui hasil green bean.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/batch"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#6E5D53] shadow-xs transition-colors hover:bg-[#FAF8F5] hover:text-[#2A1810]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#8A7669]">
                {batch.id_batch}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                {batch.status_proses}
              </span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-[#2A1810]">
              Batch Olah: {batch.metode_proses}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setIsAllocationModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#3D251A]"
          >
            <Wheat className="h-4 w-4" />
            Kelola Alokasi Ceri
          </Button>
        </div>
      </div>

      {/* Batch Hero Card */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
              Metode Pascaproses
            </span>
            <p className="font-heading text-base font-bold text-[#2A1810]">
              {batch.metode_proses}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
              Mulai Olah
            </span>
            <p className="flex items-center gap-1 font-medium text-[#2A1810]">
              <Calendar className="h-3.5 w-3.5 text-[#8A7669]" />
              {formatDate(batch.tanggal_mulai_olah)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
              Total Input Ceri
            </span>
            <p className="font-heading text-base font-bold text-[#2A1810]">
              {formatNumber(batch.total_input_ceri_kg)} <span className="text-xs font-normal text-[#8A7669]">kg</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Output Green Bean
              </span>
              <button
                type="button"
                onClick={openYieldModal}
                className="text-[#8A7669] hover:text-[#2A1810]"
                title="Input Timbangan Akhir Biji Kering"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="font-heading text-base font-bold text-[#2A1810]">
              {batch.berat_green_bean_kg !== null && batch.berat_green_bean_kg !== undefined
                ? `${formatNumber(batch.berat_green_bean_kg)} kg`
                : "Belum Ditimbang"}
            </p>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
              Rendemen Hasil Olah
            </span>
            <p className="font-heading text-base font-bold text-emerald-800">
              {batch.rendemen_persen !== null && batch.rendemen_persen !== undefined
                ? `${batch.rendemen_persen.toFixed(1)}%`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#F4F0EC] pb-2 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("stages")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
            activeTab === "stages"
              ? "bg-[#2A1810] text-white shadow-xs"
              : "bg-white text-[#6E5D53] hover:bg-[#FAF8F5] hover:text-[#2A1810]"
          }`}
        >
          <Clock className="h-4 w-4" />
          Linimasa Tahapan Olah (M3.2)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("traceability")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
            activeTab === "traceability"
              ? "bg-[#2A1810] text-white shadow-xs"
              : "bg-white text-[#6E5D53] hover:bg-[#FAF8F5] hover:text-[#2A1810]"
          }`}
        >
          <QrCode className="h-4 w-4" />
          Matriks Traceability & Silsilah Lahan (M3.3)
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "stages" && <BatchStageTimeline batch={batch} />}
      {activeTab === "traceability" && <BatchTraceabilityCard batch={batch} />}

      {/* Modal: Alokasi Panen */}
      <BatchPanenAllocationModal
        batch={batch}
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
      />

      {/* Modal: Edit Green Bean Output & Rendemen */}
      {isEditYieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F4F0EC] pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#8A7669]" />
                <h3 className="font-heading text-sm font-bold text-[#2A1810]">
                  Input Hasil Green Bean Kering
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditYieldModalOpen(false)}
                className="rounded-lg p-1 text-[#8A7669] hover:bg-[#FAF8F5] hover:text-[#2A1810]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveYield} className="mt-4 space-y-4">
              {yieldError && (
                <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700">
                  {yieldError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                  Berat Green Bean Akhir (kg)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Contoh: 18.5"
                    value={greenBeanInput}
                    onChange={(e) => setGreenBeanInput(e.target.value)}
                    required
                    className="rounded-xl border-[#E8E2DC] pr-10 text-xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8A7669]">
                    kg
                  </span>
                </div>
                <p className="text-[10px] text-[#8A7669]">
                  Sistem akan otomatis menghitung rendemen persen (% yield) berdasarkan rasio terhadap total ceri panen ({batch.total_input_ceri_kg} kg).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F4F0EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditYieldModalOpen(false)}
                  className="rounded-xl border-[#E8E2DC] px-4 py-2 text-xs font-semibold text-[#6E5D53]"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D251A]"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Simpan & Hitung Rendemen</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
