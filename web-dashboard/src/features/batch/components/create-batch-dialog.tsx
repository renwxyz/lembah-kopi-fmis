"use client";

import { useState } from "react";
import { Layers, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-error";
import { useCreateBatch, useProcessingMethods } from "../hooks/use-batch";
import type { CreateBatchInput } from "../types";

interface CreateBatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBatchId: string) => void;
}

export function CreateBatchDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateBatchDialogProps) {
  const { data: methods = [] } = useProcessingMethods();
  const createMutation = useCreateBatch();

  const [methodCode, setMethodCode] = useState<string>("NATURAL");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [estimatedDate, setEstimatedDate] = useState("");
  const [targetMoisture, setTargetMoisture] = useState("12");
  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!methodCode) {
      setFormError("Pilih metode pengolahan pascaproses.");
      return;
    }

    const moistureNum = targetMoisture ? parseFloat(targetMoisture) : undefined;
    if (moistureNum !== undefined && (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100)) {
      setFormError("Target kadar air harus bernilai antara 0 - 100%.");
      return;
    }

    try {
      const input: CreateBatchInput = {
        metode_proses: methodCode,
        tanggal_mulai_olah: startDate,
        estimasi_tanggal_selesai: estimatedDate || undefined,
        target_kadar_air_persen: moistureNum,
      };

      const result = await createMutation.mutateAsync(input);
      onClose();
      if (onSuccess) {
        onSuccess(result.id_batch);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("Gagal membuat batch pascaproses baru.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F4F0EC] pb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#8A7669]" />
            <h3 className="font-heading text-sm font-bold text-[#2A1810]">
              Buka Batch Pascaproses Baru
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
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

          {/* Metode Pascaproses */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
              Metode Pengolahan
            </label>
            <select
              value={methodCode}
              onChange={(e) => setMethodCode(e.target.value)}
              required
              className="w-full rounded-xl border border-[#E8E2DC] bg-white px-3 py-2 text-xs font-semibold text-[#2A1810] outline-none focus:ring-1 focus:ring-[#2A1810]"
            >
              {methods.length === 0 ? (
                <>
                  <option value="NATURAL">Natural (Kering Ceri Utuh)</option>
                  <option value="WASH">Wash / Wet Process</option>
                  <option value="FULL_WASH">Full Wash (Rendam & Cuci Bersih)</option>
                  <option value="WINE">Wine Process (Fermentasi Anaerob)</option>
                  <option value="HONEY">Honey / Pulped Natural</option>
                </>
              ) : (
                methods
                  .filter((m) => m.aktif)
                  .map((m) => (
                    <option key={m.kode_metode} value={m.kode_metode}>
                      {m.nama_metode} ({m.kode_metode})
                    </option>
                  ))
              )}
            </select>
            <p className="text-[10px] text-[#8A7669]">
              Metode menentukan alur fermentasi, pencucian, dan target rendemen rasa.
            </p>
          </div>

          {/* Tanggal Mulai Olah */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
              Tanggal Mulai Olah
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="rounded-xl border-[#E8E2DC] text-xs"
            />
          </div>

          {/* Estimasi Selesai */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
              Estimasi Tanggal Selesai (Opsional)
            </label>
            <Input
              type="date"
              value={estimatedDate}
              onChange={(e) => setEstimatedDate(e.target.value)}
              className="rounded-xl border-[#E8E2DC] text-xs"
            />
          </div>

          {/* Target Kadar Air % */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
              Target Kadar Air Biji Kering (%)
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="11 - 12%"
                value={targetMoisture}
                onChange={(e) => setTargetMoisture(e.target.value)}
                className="rounded-xl border-[#E8E2DC] pr-10 text-xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8A7669]">
                %
              </span>
            </div>
            <p className="text-[10px] text-[#8A7669]">
              Standar SNI kadar air green bean kopi berkisar antara 11.0% - 12.5%.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F4F0EC]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-[#E8E2DC] px-4 py-2 text-xs font-semibold text-[#6E5D53]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D251A]"
            >
              {createMutation.isPending ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Membuka Batch...</span>
                </div>
              ) : (
                <span>Buka Batch Sekarang</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
