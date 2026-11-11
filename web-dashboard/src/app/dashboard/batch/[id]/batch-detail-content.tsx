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
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        <span className="ml-2 text-xs text-text-muted">Memuat data batch pascaproses...</span>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-10 w-10 text-warning-ink" />
        <h2 className="mt-3 font-heading text-base font-bold text-coffee-900">
          Batch Tidak Ditemukan
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Data batch pascaproses dengan ID &quot;{id}&quot; tidak ditemukan di server.
        </p>
        <Link
          href="/dashboard/batch"
          className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white min-h-10"
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
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-text-muted shadow-xs transition-colors hover:bg-cream-50 hover:text-coffee-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-text-muted">
                {batch.id_batch}
              </span>
              <span className="rounded-full bg-success-tint px-2 py-0.5 text-[10px] font-semibold text-success-ink">
                {batch.status_proses}
              </span>
            </div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-coffee-900">
              Batch Olah: {batch.metode_proses}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setIsAllocationModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary-hover min-h-10"
          >
            <Wheat className="h-4 w-4" />
            Kelola Alokasi Ceri
          </Button>
        </div>
      </div>

      {/* Batch Hero Card */}
      <div className="rounded-2xl bg-surface p-6 border border-border">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Metode Pascaproses
            </span>
            <p className="font-heading text-base font-bold text-coffee-900">
              {batch.metode_proses}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Mulai Olah
            </span>
            <p className="flex items-center gap-1 font-medium text-coffee-900">
              <Calendar className="h-3.5 w-3.5 text-text-muted" />
              {formatDate(batch.tanggal_mulai_olah)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Total Input Ceri
            </span>
            <p className="font-heading text-base font-bold text-coffee-900">
              {formatNumber(batch.total_input_ceri_kg)} <span className="text-xs font-normal text-text-muted">kg</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Output Green Bean
              </span>
              <button
                type="button"
                onClick={openYieldModal}
                className="text-text-muted hover:text-coffee-900"
                title="Input Timbangan Akhir Biji Kering"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="font-heading text-base font-bold text-coffee-900">
              {batch.berat_green_bean_kg !== null && batch.berat_green_bean_kg !== undefined
                ? `${formatNumber(batch.berat_green_bean_kg)} kg`
                : "Belum Ditimbang"}
            </p>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Rendemen Hasil Olah
            </span>
            <p className="font-heading text-base font-bold text-success-ink">
              {batch.rendemen_persen !== null && batch.rendemen_persen !== undefined
                ? `${batch.rendemen_persen.toFixed(1)}%`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-2 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("stages")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
            activeTab === "stages"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface text-text-muted hover:bg-cream-50 hover:text-coffee-900"
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
              ? "bg-primary text-white shadow-xs"
              : "bg-surface text-text-muted hover:bg-cream-50 hover:text-coffee-900"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-text-muted" />
                <h3 className="font-heading text-sm font-bold text-coffee-900">
                  Input Hasil Green Bean Kering
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditYieldModalOpen(false)}
                className="rounded-lg p-1 text-text-muted hover:bg-cream-50 hover:text-coffee-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveYield} className="mt-4 space-y-4">
              {yieldError && (
                <div className="rounded-xl bg-danger-tint p-2.5 text-xs text-danger-ink">
                  {yieldError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
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
                    className="rounded-xl border-border pr-10 text-xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                    kg
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">
                  Sistem akan otomatis menghitung rendemen persen (% yield) berdasarkan rasio terhadap total ceri panen ({batch.total_input_ceri_kg} kg).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditYieldModalOpen(false)}
                  className="rounded-xl border-border px-4 py-2 text-xs font-semibold text-text-muted"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover min-h-10"
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
