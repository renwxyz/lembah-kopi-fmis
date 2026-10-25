"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Plus,
  Loader2,
  X,
  Droplets,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api-error";
import { useAddBatchStage, useBatchStages } from "../hooks/use-batch";
import type { AddStageInput, ProcessingBatch, ProcessingStatus } from "../types";

interface BatchStageTimelineProps {
  batch: ProcessingBatch;
}

const statusDisplayMap: Record<
  ProcessingStatus,
  { label: string; bg: string; text: string; step: number }
> = {
  FERMENTASI: {
    label: "Tahap 1: Fermentasi",
    bg: "bg-amber-50",
    text: "text-amber-800",
    step: 1,
  },
  PENGERINGAN: {
    label: "Tahap 2: Penjemuran / Pengeringan",
    bg: "bg-orange-50",
    text: "text-orange-800",
    step: 2,
  },
  HULLING_RESTING: {
    label: "Tahap 3: Hulling & Resting (Green Bean)",
    bg: "bg-blue-50",
    text: "text-blue-800",
    step: 3,
  },
  SELESAI: {
    label: "Tahap 4: Batch Selesai (Siap Distribusi)",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    step: 4,
  },
};

export function BatchStageTimeline({ batch }: BatchStageTimelineProps) {
  const { data: stages = [], isLoading } = useBatchStages(batch.id_batch);
  const addStageMutation = useAddBatchStage(batch.id_batch);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<ProcessingStatus>("PENGERINGAN");
  const [formMoisture, setFormMoisture] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formError, setFormError] = useState("");

  const handleOpenModal = () => {
    // suggest next status
    if (batch.status_proses === "FERMENTASI") setFormStatus("PENGERINGAN");
    else if (batch.status_proses === "PENGERINGAN") setFormStatus("HULLING_RESTING");
    else if (batch.status_proses === "HULLING_RESTING") setFormStatus("SELESAI");
    else setFormStatus("SELESAI");

    setFormMoisture("");
    setFormNote("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const moistureNum = formMoisture ? parseFloat(formMoisture) : undefined;
    if (moistureNum !== undefined && (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100)) {
      setFormError("Kadar air harus bernilai antara 0 - 100%.");
      return;
    }

    try {
      const input: AddStageInput = {
        status_proses: formStatus,
        kadar_air_persen: moistureNum,
        catatan: formNote.trim() || undefined,
      };
      await addStageMutation.mutateAsync(input);
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("Gagal memperbarui tahapan batch.");
      }
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#F4F0EC] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#8A7669]" />
            <h3 className="font-heading text-base font-bold text-[#2A1810]">
              Linimasa & Riwayat Tahapan Pascaproses
            </h3>
          </div>
          <p className="mt-1 text-xs text-[#8A7669]">
            Monitoring tahapan dari fermentasi ceri, penjemuran/drying, pengupasan kulit tanduk, hingga kadar air stabil.
          </p>
        </div>

        {batch.status_proses !== "SELESAI" && (
          <Button
            type="button"
            onClick={handleOpenModal}
            className="flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#3D251A]"
          >
            <Plus className="h-4 w-4" />
            Catat Perubahan Tahapan
          </Button>
        )}
      </div>

      {/* Timeline List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#8A7669]" />
          <span className="ml-2 text-xs text-[#8A7669]">Memuat linimasa tahapan...</span>
        </div>
      ) : stages.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8A7669]">
          Belum ada riwayat tahapan tercatat untuk batch ini.
        </div>
      ) : (
        <div className="relative mt-6 space-y-6 pl-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-[#E8E2DC]">
          {stages.map((stage, idx) => {
            const isLatest = idx === 0;
            const meta = statusDisplayMap[stage.status_proses] || {
              label: stage.status_proses,
              bg: "bg-slate-50",
              text: "text-slate-800",
              step: 0,
            };

            return (
              <div key={stage.id_riwayat_tahap} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white transition-all ${
                    isLatest
                      ? "bg-[#2A1810] ring-4 ring-[#FAF8F5]"
                      : "bg-[#8A7669]"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>

                <div className="rounded-xl bg-[#FAF8F5]/80 p-4 transition-all hover:bg-[#FAF8F5]">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${meta.bg} ${meta.text}`}
                      >
                        {meta.label}
                      </span>
                      {isLatest && (
                        <span className="rounded-full bg-[#2A1810] px-2 py-0.5 text-[10px] font-semibold text-white">
                          Status Berjalan
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8A7669]">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(stage.tanggal_perubahan || stage.created_at)}
                    </div>
                  </div>

                  {/* Stage Metrics: Moisture & Notes */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs">
                    {stage.kadar_air_persen !== null && stage.kadar_air_persen !== undefined && (
                      <div className="flex items-center gap-1 font-medium text-[#2A1810]">
                        <Droplets className="h-3.5 w-3.5 text-blue-600" />
                        <span>Kadar Air: </span>
                        <strong className="font-semibold text-blue-700">
                          {stage.kadar_air_persen}%
                        </strong>
                      </div>
                    )}

                    {stage.catatan && (
                      <div className="flex items-center gap-1 text-[#6E5D53]">
                        <FileText className="h-3.5 w-3.5 text-[#8A7669]" />
                        <span>{stage.catatan}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog for Transitioning Stage */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F4F0EC] pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#8A7669]" />
                <h3 className="font-heading text-sm font-bold text-[#2A1810]">
                  Catat Perubahan Tahapan Batch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[#8A7669] hover:bg-[#FAF8F5] hover:text-[#2A1810]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">
                  {formError}
                </div>
              )}

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                  Pilih Tahapan Baru
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as ProcessingStatus)}
                  required
                  className="w-full rounded-xl border border-[#E8E2DC] bg-white px-3 py-2 text-xs font-semibold text-[#2A1810] outline-none focus:ring-1 focus:ring-[#2A1810]"
                >
                  <option value="FERMENTASI">1. FERMENTASI (Perendaman / Anaerob)</option>
                  <option value="PENGERINGAN">2. PENGERINGAN (Penjemuran Green House/Para-para)</option>
                  <option value="HULLING_RESTING">3. HULLING_RESTING (Kupas Kulit & Resting Biji)</option>
                  <option value="SELESAI">4. SELESAI (Kadar Air Stabil & Siap Jual)</option>
                </select>
              </div>

              {/* Kadar Air % */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                  Pengukuran Kadar Air Biji Kering (%)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="Contoh: 14.5"
                    value={formMoisture}
                    onChange={(e) => setFormMoisture(e.target.value)}
                    className="rounded-xl border-[#E8E2DC] pr-10 text-xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8A7669]">
                    %
                  </span>
                </div>
              </div>

              {/* Catatan Lapangan */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                  Catatan Lapangan / Evaluasi Suhu / Jam Fermentasi
                </label>
                <textarea
                  rows={3}
                  placeholder="Misal: Fermentasi 36 jam selesai dengan aroma fruity tajam, dipindah ke para-para penjemuran."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E2DC] p-3 text-xs text-[#2A1810] outline-none focus:ring-1 focus:ring-[#2A1810]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F4F0EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border-[#E8E2DC] px-4 py-2 text-xs font-semibold text-[#6E5D53]"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={addStageMutation.isPending}
                  className="rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D251A]"
                >
                  {addStageMutation.isPending ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    <span>Perbarui Tahapan</span>
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

