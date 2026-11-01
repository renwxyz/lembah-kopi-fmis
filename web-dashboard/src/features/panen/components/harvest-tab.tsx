"use client";

import { useState } from "react";
import {
  Wheat,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  Scale,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatNumber } from "@/lib/format";
import { ApiError } from "@/lib/api-error";
import { useLahanInventory } from "@/features/lahan/hooks/use-lahan-list";
import {
  useCreateHarvest,
  useDeleteHarvest,
  useHarvestList,
  useUpdateHarvest,
} from "../hooks/use-panen";
import type {
  CreateHarvestInput,
  HarvestLog,
  PickingMethod,
} from "../types";

interface HarvestTabProps {
  landId: string;
}

export function HarvestTab({ landId }: HarvestTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HarvestLog | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: harvestData, isLoading, isError, refetch } = useHarvestList(landId);
  const { data: inventories = [] } = useLahanInventory(landId);

  const harvests = harvestData?.items ?? [];

  // Summary Metrics
  const totalWeightKg = harvests.reduce((acc, h) => acc + (h.berat_ceri_kg || 0), 0);
  const redCherryHarvests = harvests.filter((h) => h.metode_petik === "PETIK_MERAH");
  const redCherryWeightKg = redCherryHarvests.reduce((acc, h) => acc + (h.berat_ceri_kg || 0), 0);
  const redCherryRatio = totalWeightKg > 0 ? (redCherryWeightKg / totalWeightKg) * 100 : 0;

  // Mutations
  const createMutation = useCreateHarvest(landId);
  const updateMutation = useUpdateHarvest();
  const deleteMutation = useDeleteHarvest();

  // Form State
  const [formDate, setFormDate] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formMethod, setFormMethod] = useState<PickingMethod>("PETIK_MERAH");
  const [formInventoryId, setFormInventoryId] = useState("");
  const [formError, setFormError] = useState("");

  const openCreateModal = () => {
    setEditingItem(null);
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormWeight("");
    setFormMethod("PETIK_MERAH");
    setFormInventoryId(inventories[0]?.id_inventaris ?? "");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: HarvestLog) => {
    setEditingItem(item);
    setFormDate(item.tanggal_panen ? item.tanggal_panen.slice(0, 10) : "");
    setFormWeight(String(item.berat_ceri_kg));
    setFormMethod(item.metode_petik);
    setFormInventoryId(item.id_inventaris || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!editingItem && !formInventoryId) {
      setFormError(
        "Blok tanaman & varietas wajib dipilih. Jika belum tersedia, tambahkan blok inventaris tanaman di detail lahan terlebih dahulu.",
      );
      return;
    }

    const weightNum = parseFloat(formWeight);
    if (!formWeight || isNaN(weightNum) || weightNum <= 0) {
      setFormError("Berat ceri harus berupa angka positif.");
      return;
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id_panen,
          input: {
            tanggal_panen: formDate,
            berat_ceri_kg: weightNum,
            metode_petik: formMethod,
          },
        });
      } else {
        const input: CreateHarvestInput = {
          tanggal_panen: formDate,
          berat_ceri_kg: weightNum,
          metode_petik: formMethod,
          id_inventaris: formInventoryId || undefined,
        };
        await createMutation.mutateAsync(input);
      }
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("Terjadi kegagalan saat menyimpan data panen.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan hasil panen ini?")) return;
    try {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus panen");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF8F5] text-[#2A1810]">
              <Scale className="h-5 w-5 text-[#8A7669]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Total Timbangan Ceri
              </p>
              <p className="font-heading text-xl font-bold text-[#2A1810]">
                {formatNumber(totalWeightKg)} <span className="text-xs font-normal text-[#8A7669]">kg</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Rasio Petik Merah
              </p>
              <p className="font-heading text-xl font-bold text-emerald-800">
                {redCherryRatio.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF8F5] text-[#2A1810]">
              <Wheat className="h-5 w-5 text-[#8A7669]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Jumlah Sesi Panen
              </p>
              <p className="font-heading text-xl font-bold text-[#2A1810]">
                {harvests.length} <span className="text-xs font-normal text-[#8A7669]">kali</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[#F4F0EC] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-[#8A7669]" />
              <h2 className="font-heading text-base font-bold text-[#2A1810]">
                Riwayat Hasil Panen Ceri Kopi
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#8A7669]">
              Pencatatan timbangan ceri harian dari petak lahan ini beserta klasifikasi petik (Sub-Modul M3.1).
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#3D251A]"
          >
            <Plus className="h-4 w-4" />
            Catat Panen Ceri Baru
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#8A7669]" />
            <span className="ml-2 text-xs text-[#8A7669]">Memuat riwayat panen...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-8 w-8 text-amber-600" />
            <p className="mt-2 text-xs font-semibold text-[#2A1810]">
              Gagal memuat catatan panen.
            </p>
            <Button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#2A1810]"
            >
              Coba Lagi
            </Button>
          </div>
        ) : harvests.length === 0 ? (
          <div className="py-12 text-center">
            <Wheat className="mx-auto h-10 w-10 text-[#C4B7AC]" />
            <h3 className="mt-3 font-heading text-sm font-bold text-[#2A1810]">
              Belum Ada Catatan Panen
            </h3>
            <p className="mt-1 text-xs text-[#8A7669] max-w-sm mx-auto">
              Klik tombol &quot;Catat Panen Ceri Baru&quot; di atas untuk memasukkan hasil timbangan panen dari petak ini.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F4F0EC] text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                  <th className="pb-3 pr-4">Kode Transaksi</th>
                  <th className="pb-3 px-4">Tanggal Panen</th>
                  <th className="pb-3 px-4">Timbangan (kg)</th>
                  <th className="pb-3 px-4">Metode Petik</th>
                  <th className="pb-3 px-4">Varietas</th>
                  <th className="pb-3 px-4">Status Alokasi Batch</th>
                  <th className="pb-3 pl-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF8F5]">
                {harvests.map((item) => (
                  <tr key={item.id_panen} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-medium text-[#2A1810]">
                      {item.id_panen}
                    </td>
                    <td className="py-3.5 px-4 text-[#6E5D53]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#8A7669]" />
                        {formatDate(item.tanggal_panen)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-heading text-sm font-bold text-[#2A1810]">
                      {formatNumber(item.berat_ceri_kg)} kg
                    </td>
                    <td className="py-3.5 px-4">
                      {item.metode_petik === "PETIK_MERAH" ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Petik Merah (Sortasi Super)
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                          Petik Pelangi / Campur
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-md bg-[#FAF8F5] px-2 py-0.5 text-[11px] font-semibold text-[#2A1810]">
                        {item.varietas}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status_alokasi === "UNPROCESSED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          Belum Masuk Batch
                        </span>
                      )}
                      {item.status_alokasi === "PARTIAL" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          <Layers className="h-3 w-3" />
                          Sebagian Dialokasi
                        </span>
                      )}
                      {item.status_alokasi === "FULLY_BATCHED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                          <Layers className="h-3 w-3" />
                          Selesai Dialokasi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(item)}
                          disabled={item.status_alokasi === "FULLY_BATCHED"}
                          className="h-8 w-8 text-[#8A7669] hover:text-[#2A1810]"
                          title={item.status_alokasi === "FULLY_BATCHED" ? "Sudah terkunci di batch" : "Ubah Data"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id_panen)}
                          disabled={
                            deletingId === item.id_panen ||
                            item.status_alokasi !== "UNPROCESSED"
                          }
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                          title={
                            item.status_alokasi !== "UNPROCESSED"
                              ? "Ceri sudah dialokasikan ke batch pascaproses"
                              : "Hapus Data"
                          }
                        >
                          {deletingId === item.id_panen ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F4F0EC] pb-4">
              <div className="flex items-center gap-2">
                <Wheat className="h-5 w-5 text-[#8A7669]" />
                <h3 className="font-heading text-sm font-bold text-[#2A1810]">
                  {editingItem ? "Ubah Data Hasil Panen" : "Catat Hasil Panen Ceri"}
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

              {/* Tanggal Panen */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                  Tanggal Panen
                </label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="rounded-xl border-[#E8E2DC] text-xs"
                />
              </div>

              {/* Blok Tanaman (Inventaris) - Only on Create */}
              {!editingItem && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                    Blok Tanaman & Varietas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formInventoryId}
                    onChange={(e) => setFormInventoryId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#E8E2DC] bg-white px-3 py-2 text-xs font-medium text-[#2A1810] outline-none focus:ring-1 focus:ring-[#2A1810]"
                  >
                    <option value="">
                      {inventories.length === 0
                        ? "Belum ada blok tanaman di lahan ini"
                        : "Pilih Blok Tanaman..."}
                    </option>
                    {inventories.map((inv) => (
                      <option key={inv.id_inventaris} value={inv.id_inventaris}>
                        {inv.varietas} — {inv.kelompok_usia.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#8A7669]">
                    {inventories.length === 0
                      ? "Tambahkan blok tanaman terlebih dahulu pada halaman Detail Lahan."
                      : "Mengaitkan panen dengan blok tanaman menentukan varietas kopi dan silsilah tanaman saat batching."}
                  </p>
                </div>
              )}

              {/* Berat Ceri (kg) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                  Berat Timbangan Ceri (kg)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Contoh: 150.5"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    required
                    className="rounded-xl border-[#E8E2DC] pr-10 text-xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8A7669]">
                    kg
                  </span>
                </div>
              </div>

              {/* Metode Pemetikan */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                  Metode Petik & Sortasi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormMethod("PETIK_MERAH")}
                    className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                      formMethod === "PETIK_MERAH"
                        ? "bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600"
                        : "bg-[#FAF8F5] text-[#6E5D53] hover:bg-[#F4F0EC]"
                    }`}
                  >
                    <span className="text-xs font-bold">Petik Merah</span>
                    <span className="text-[10px] text-emerald-700">Sortasi Super Ceri Matang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormMethod("PETIK_PELANGI")}
                    className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                      formMethod === "PETIK_PELANGI"
                        ? "bg-amber-50 text-amber-900 ring-2 ring-amber-600"
                        : "bg-[#FAF8F5] text-[#6E5D53] hover:bg-[#F4F0EC]"
                    }`}
                  >
                    <span className="text-xs font-bold">Petik Pelangi</span>
                    <span className="text-[10px] text-amber-700">Campuran Matang & Semi</span>
                  </button>
                </div>
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D251A]"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    <span>{editingItem ? "Perbarui Panen" : "Simpan Catatan"}</span>
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
