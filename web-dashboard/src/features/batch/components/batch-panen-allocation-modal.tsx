"use client";

import { useState } from "react";
import {
  Wheat,
  Plus,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatNumber } from "@/lib/format";
import { ApiError } from "@/lib/api-error";
import { useLahanList } from "@/features/lahan/hooks/use-lahan-list";
import { useHarvestList } from "@/features/panen/hooks/use-panen";
import {
  useAddBatchMapping,
  useBatchMappings,
  useDeleteBatchMapping,
} from "../hooks/use-batch";
import type { ProcessingBatch } from "../types";

interface BatchPanenAllocationModalProps {
  batch: ProcessingBatch;
  isOpen: boolean;
  onClose: () => void;
}

export function BatchPanenAllocationModal({
  batch,
  isOpen,
  onClose,
}: BatchPanenAllocationModalProps) {
  const { data: lahanData } = useLahanList();
  const lahanList = lahanData?.items ?? [];

  const [selectedLandId, setSelectedLandId] = useState<string>(
    lahanList[0]?.id_lahan ?? "",
  );

  const { data: mappings = [], isLoading: isLoadingMappings } =
    useBatchMappings(batch.id_batch);
  const { data: harvestData, isLoading: isLoadingHarvests } = useHarvestList(
    selectedLandId || (lahanList[0]?.id_lahan ?? ""),
  );

  const addMappingMutation = useAddBatchMapping(batch.id_batch);
  const deleteMappingMutation = useDeleteBatchMapping(batch.id_batch);

  const [selectedHarvestId, setSelectedHarvestId] = useState("");
  const [usedWeight, setUsedWeight] = useState("");
  const [formError, setFormError] = useState("");
  const [deletingMappingId, setDeletingMappingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormError("");
    setSelectedHarvestId("");
    setUsedWeight("");
    onClose();
  };

  const availableHarvests = (harvestData?.items ?? []).filter(
    (h) => h.status_alokasi !== "FULLY_BATCHED",
  );

  const activeLandId = selectedLandId || (lahanList[0]?.id_lahan ?? "");

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedHarvestId) {
      setFormError("Pilih salah satu catatan panen yang tersedia.");
      return;
    }

    const weightNum = parseFloat(usedWeight);
    if (!usedWeight || isNaN(weightNum) || weightNum <= 0) {
      setFormError("Berat ceri yang dialokasikan harus angka lebih dari 0 kg.");
      return;
    }

    const selectedHarvest = availableHarvests.find(
      (h) => h.id_panen === selectedHarvestId,
    );
    if (selectedHarvest && weightNum > selectedHarvest.berat_ceri_kg) {
      setFormError(
        `Alokasi tidak boleh melebihi sisa ceri pada panen ini (${selectedHarvest.berat_ceri_kg} kg).`,
      );
      return;
    }

    try {
      await addMappingMutation.mutateAsync({
        id_panen: selectedHarvestId,
        berat_digunakan_kg: weightNum,
      });
      setSelectedHarvestId("");
      setUsedWeight("");
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("Gagal mengalokasikan panen ke batch.");
      }
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm("Hapus alokasi panen ini dari batch?")) return;
    try {
      setDeletingMappingId(mappingId);
      await deleteMappingMutation.mutateAsync(mappingId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus alokasi");
    } finally {
      setDeletingMappingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F4F0EC] pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-[#8A7669]" />
              <h3 className="font-heading text-sm font-bold text-[#2A1810]">
                Alokasi Hasil Panen ke Batch {batch.id_batch}
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-[#8A7669]">
              Gabungkan timbangan ceri dari satu atau beberapa kebun ke dalam batch olahan ini (M3.3).
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-[#8A7669] hover:bg-[#FAF8F5] hover:text-[#2A1810]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          {/* Section 1: Form Tambah Alokasi */}
          <div className="rounded-xl bg-[#FAF8F5] p-4 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#2A1810]">
              + Masukkan Ceri Panen ke Batch
            </h4>

            {formError && (
              <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddAllocation} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Pilih Lahan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8A7669]">
                    Lahan Asal Panen
                  </label>
                  <select
                    value={activeLandId}
                    onChange={(e) => {
                      setSelectedLandId(e.target.value);
                      setSelectedHarvestId("");
                    }}
                    className="w-full rounded-xl border border-[#E8E2DC] bg-white px-3 py-2 text-xs font-medium text-[#2A1810] outline-none"
                  >
                    {lahanList.map((l) => (
                      <option key={l.id_lahan} value={l.id_lahan}>
                        {l.nama_petak} ({l.dusun})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pilih Transaksi Panen */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8A7669]">
                    Catatan Panen Tersedia
                  </label>
                  <select
                    value={selectedHarvestId}
                    onChange={(e) => {
                      setSelectedHarvestId(e.target.value);
                      const chosen = availableHarvests.find(
                        (h) => h.id_panen === e.target.value,
                      );
                      if (chosen) setUsedWeight(String(chosen.berat_ceri_kg));
                    }}
                    disabled={isLoadingHarvests}
                    className="w-full rounded-xl border border-[#E8E2DC] bg-white px-3 py-2 text-xs font-medium text-[#2A1810] outline-none"
                  >
                    <option value="">Pilih sesi panen...</option>
                    {availableHarvests.map((h) => (
                      <option key={h.id_panen} value={h.id_panen}>
                        {h.id_panen} • {formatDate(h.tanggal_panen)} • {h.berat_ceri_kg} kg ({h.metode_petik})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Berat yang dialokasikan */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8A7669]">
                    Berat Ceri yang Diproses di Batch Ini (kg)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Misal: 100"
                      value={usedWeight}
                      onChange={(e) => setUsedWeight(e.target.value)}
                      className="rounded-xl border-[#E8E2DC] bg-white pr-10 text-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8A7669]">
                      kg
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={addMappingMutation.isPending || !selectedHarvestId}
                  className="rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D251A] shrink-0"
                >
                  {addMappingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Alokasikan Ceri
                </Button>
              </div>
            </form>
          </div>

          {/* Section 2: Daftar Alokasi yang Sudah Masuk ke Batch Ini */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#8A7669]">
              Daftar Alokasi Panen di Batch Ini ({mappings.length})
            </h4>

            {isLoadingMappings ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[#8A7669]" />
                <span className="ml-2 text-xs text-[#8A7669]">Memuat alokasi...</span>
              </div>
            ) : mappings.length === 0 ? (
              <p className="mt-2 text-xs text-[#8A7669] italic">
                Belum ada ceri yang dimasukkan ke batch ini. Gunakan formulir di atas untuk mengaitkan panen.
              </p>
            ) : (
              <div className="mt-3 divide-y divide-[#F4F0EC] border-t border-[#F4F0EC]">
                {mappings.map((m) => (
                  <div
                    key={m.id_mapping}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-[#2A1810]">
                          {m.id_panen}
                        </span>
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          {formatNumber(m.berat_digunakan_kg)} kg
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8A7669]">
                        ID Mapping: {m.id_mapping}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMapping(m.id_mapping)}
                      disabled={deletingMappingId === m.id_mapping}
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      {deletingMappingId === m.id_mapping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#F4F0EC] pt-4 shrink-0">
          <div className="text-xs text-[#6E5D53]">
            Total Akumulasi Ceri Batch:{" "}
            <strong className="font-bold text-[#2A1810]">
              {formatNumber(batch.total_input_ceri_kg)} kg
            </strong>
          </div>
          <Button
            type="button"
            onClick={handleClose}
            className="rounded-xl bg-[#FAF8F5] px-4 py-2 text-xs font-semibold text-[#2A1810] hover:bg-[#F4F0EC]"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
