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
        <div className="rounded-xl bg-surface p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-50 text-coffee-900">
              <Scale className="h-5 w-5 text-text-muted" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Total Timbangan Ceri
              </p>
              <p className="font-heading text-xl font-bold text-coffee-900">
                {formatNumber(totalWeightKg)} <span className="text-xs font-normal text-text-muted">kg</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-tint text-success-ink">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Rasio Petik Merah
              </p>
              <p className="font-heading text-xl font-bold text-success-ink">
                {redCherryRatio.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-50 text-coffee-900">
              <Wheat className="h-5 w-5 text-text-muted" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Jumlah Sesi Panen
              </p>
              <p className="font-heading text-xl font-bold text-coffee-900">
                {harvests.length} <span className="text-xs font-normal text-text-muted">kali</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl bg-surface p-6 border border-border">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-text-muted" />
              <h2 className="font-heading text-base font-bold text-coffee-900">
                Riwayat Hasil Panen Ceri Kopi
              </h2>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Pencatatan timbangan ceri harian dari petak lahan ini beserta klasifikasi petik (Sub-Modul M3.1).
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-primary-hover min-h-10"
          >
            <Plus className="h-4 w-4" />
            Catat Panen Ceri Baru
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            <span className="ml-2 text-xs text-text-muted">Memuat riwayat panen...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-8 w-8 text-warning-ink" />
            <p className="mt-2 text-xs font-semibold text-coffee-900">
              Gagal memuat catatan panen.
            </p>
            <Button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-cream-50 px-3 py-1.5 text-xs text-coffee-900"
            >
              Coba Lagi
            </Button>
          </div>
        ) : harvests.length === 0 ? (
          <div className="py-12 text-center">
            <Wheat className="mx-auto h-10 w-10 text-text-muted" />
            <h3 className="mt-3 font-heading text-sm font-bold text-coffee-900">
              Belum Ada Catatan Panen
            </h3>
            <p className="mt-1 text-xs text-text-muted max-w-sm mx-auto">
              Klik tombol &quot;Catat Panen Ceri Baru&quot; di atas untuk memasukkan hasil timbangan panen dari petak ini.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <th className="pb-3 pr-4">Kode Transaksi</th>
                  <th className="pb-3 px-4">Tanggal Panen</th>
                  <th className="pb-3 px-4">Timbangan (kg)</th>
                  <th className="pb-3 px-4">Metode Petik</th>
                  <th className="pb-3 px-4">Varietas</th>
                  <th className="pb-3 px-4">Status Alokasi Batch</th>
                  <th className="pb-3 pl-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {harvests.map((item) => (
                  <tr key={item.id_panen} className="hover:bg-primary-wash transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-medium text-coffee-900">
                      {item.id_panen}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-text-muted" />
                        {formatDate(item.tanggal_panen)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-heading text-sm font-bold text-coffee-900">
                      {formatNumber(item.berat_ceri_kg)} kg
                    </td>
                    <td className="py-3.5 px-4">
                      {item.metode_petik === "PETIK_MERAH" ? (
                        <span className="inline-flex items-center rounded-full bg-success-tint px-2.5 py-0.5 text-[11px] font-semibold text-success-ink">
                          Petik Merah (Sortasi Super)
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-warning-tint px-2.5 py-0.5 text-[11px] font-semibold text-warning-ink">
                          Petik Pelangi / Campur
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-md bg-cream-50 px-2 py-0.5 text-[11px] font-semibold text-coffee-900">
                        {item.varietas}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status_alokasi === "UNPROCESSED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary-tint px-2 py-0.5 text-[11px] font-medium text-coffee-900">
                          Belum Masuk Batch
                        </span>
                      )}
                      {item.status_alokasi === "PARTIAL" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-info-tint px-2 py-0.5 text-[11px] font-medium text-info-ink">
                          <Layers className="h-3 w-3" />
                          Sebagian Dialokasi
                        </span>
                      )}
                      {item.status_alokasi === "FULLY_BATCHED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-info-tint px-2 py-0.5 text-[11px] font-medium text-info-ink">
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
                          className="h-8 w-8 text-text-muted hover:text-coffee-900"
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
                          className="h-8 w-8 text-danger hover:bg-danger-tint hover:text-danger-ink"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Wheat className="h-5 w-5 text-text-muted" />
                <h3 className="font-heading text-sm font-bold text-coffee-900">
                  {editingItem ? "Ubah Data Hasil Panen" : "Catat Hasil Panen Ceri"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-text-muted hover:bg-cream-50 hover:text-coffee-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl bg-danger-tint p-3 text-xs text-danger-ink">
                  {formError}
                </div>
              )}

              {/* Tanggal Panen */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Tanggal Panen
                </label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="rounded-xl border-border text-xs"
                />
              </div>

              {/* Blok Tanaman (Inventaris) - Only on Create */}
              {!editingItem && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Blok Tanaman & Varietas <span className="text-danger">*</span>
                  </label>
                  <select
                    value={formInventoryId}
                    onChange={(e) => setFormInventoryId(e.target.value)}
                    required
                    className="w-full rounded-[10px] border border-border bg-surface px-3 py-2 text-xs font-medium text-coffee-900 outline-none focus:ring-1 focus:ring-primary"
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
                  <p className="text-[10px] text-text-muted">
                    {inventories.length === 0
                      ? "Tambahkan blok tanaman terlebih dahulu pada halaman Detail Lahan."
                      : "Mengaitkan panen dengan blok tanaman menentukan varietas kopi dan silsilah tanaman saat batching."}
                  </p>
                </div>
              )}

              {/* Berat Ceri (kg) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
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
                    className="rounded-xl border-border pr-10 text-xs"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                    kg
                  </span>
                </div>
              </div>

              {/* Metode Pemetikan */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Metode Petik & Sortasi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormMethod("PETIK_MERAH")}
                    className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                      formMethod === "PETIK_MERAH"
                        ? "bg-success-tint text-success-ink ring-2 ring-success"
                        : "bg-cream-50 text-text-muted hover:bg-primary-tint"
                    }`}
                  >
                    <span className="text-xs font-bold">Petik Merah</span>
                    <span className="text-[10px] text-success-ink">Sortasi Super Ceri Matang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormMethod("PETIK_PELANGI")}
                    className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                      formMethod === "PETIK_PELANGI"
                        ? "bg-warning-tint text-warning-ink ring-2 ring-warning-ink"
                        : "bg-cream-50 text-text-muted hover:bg-primary-tint"
                    }`}
                  >
                    <span className="text-xs font-bold">Petik Pelangi</span>
                    <span className="text-[10px] text-warning-ink">Campuran Matang & Semi</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border-border px-4 py-2 text-xs font-semibold text-text-muted"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover min-h-10"
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
