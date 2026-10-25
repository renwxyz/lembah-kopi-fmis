"use client";

import { useState } from "react";
import {
  Droplets,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatNumber } from "@/lib/format";
import { ApiError } from "@/lib/api-error";
import {
  useCreateFertilization,
  useDeleteFertilization,
  useFertilizationList,
  useUpdateFertilization,
} from "../hooks/use-agronomi";
import type { CreateFertilizationInput, Fertilization } from "../types";

interface FertilizationTabProps {
  landId: string;
}

export function FertilizationTab({ landId }: FertilizationTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Fertilization | null>(null);
  const [deletingItem, setDeletingItem] = useState<Fertilization | null>(null);

  const { data: list = [], isLoading, isError, refetch } = useFertilizationList(landId);

  const totalDosis = list.reduce((acc, curr) => acc + curr.dosis_kg, 0);
  const latestItem = list[0] || null;

  const deleteMutation = useDeleteFertilization(landId);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeletingItem(null);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#2A1810]">
            Log Riwayat Pemupukan (M2.2)
          </h2>
          <p className="mt-0.5 text-xs text-[#6E5D53]">
            Pencatatan siklus pemupukan berkala (NPK, pupuk kandang, kompos organik) per petak lahan.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="h-9 gap-1.5 rounded-lg bg-[#2A1810] px-4 text-xs font-semibold text-white hover:bg-[#3D2317] shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Catat Aplikasi Pupuk
        </Button>
      </div>

      {/* KPI Cards for Fertilization */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
              Total Dosis Pupuk
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold tracking-tight text-[#2A1810]">
                {formatNumber(totalDosis, 1)}
              </span>
              <span className="text-xs font-semibold text-[#6E5D53]">kg</span>
            </div>
            <span className="text-xs text-[#6E5D53]">Akumulasi seluruh aplikasi tercatat</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
            <Scale className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
              Aplikasi Terakhir
            </span>
            <span className="mt-1 font-heading text-lg font-bold tracking-tight text-[#2A1810] block">
              {latestItem ? formatDate(latestItem.tanggal_aplikasi) : "—"}
            </span>
            <span className="text-xs text-[#6E5D53]">
              {latestItem ? `${latestItem.jenis_pupuk} (${latestItem.dosis_kg} kg)` : "Belum ada aplikasi"}
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-900">
            <Droplets className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
              Frekuensi Aplikasi
            </span>
            <span className="mt-1 font-heading text-2xl font-bold tracking-tight text-[#2A1810] block">
              {list.length}
            </span>
            <span className="text-xs text-[#6E5D53]">Kali pemupukan terjadwal</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#2A1810]">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-[#2A1810] border-t-transparent" />
            <p className="mt-2 text-xs text-[#8A7669]">Memuat riwayat pemupukan...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-xs font-semibold text-red-600">Gagal memuat log pemupukan.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2 h-8 text-xs">
              Coba Lagi
            </Button>
          </div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#8A7669]">
              <Droplets className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-heading text-sm font-bold text-[#2A1810]">
              Belum Ada Catatan Pemupukan
            </h3>
            <p className="mt-1 text-xs text-[#8A7669] max-w-sm mx-auto">
              Catat setiap jadwal aplikasi pupuk berkala untuk memantau efek perbaikan kesuburan tanah.
            </p>
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="mt-4 h-9 gap-1.5 rounded-lg bg-[#2A1810] text-xs font-semibold text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Catat Aplikasi Pertama
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F4F0EC] bg-[#FCFBF9] text-[11px] font-semibold text-[#8A7669] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Tanggal Aplikasi</th>
                  <th className="px-6 py-3.5">Jenis Pupuk</th>
                  <th className="px-6 py-3.5">Dosis Aplikasi (kg)</th>
                  <th className="px-6 py-3.5">ID Aktivitas</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0EC]">
                {list.map((item) => (
                  <tr key={item.id_pemupukan} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#8A7669]" />
                        <span className="font-medium text-[#2A1810]">
                          {formatDate(item.tanggal_aplikasi)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-sm text-[#2A1810] block">
                        {item.jenis_pupuk}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading font-bold text-sm text-[#2A1810]">
                          {formatNumber(item.dosis_kg, 1)}
                        </span>
                        <span className="text-[#8A7669] text-xs">kg</span>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs text-[#6E5D53] bg-[#FAF8F5] px-2 py-0.5 rounded-md">
                        {item.id_pemupukan}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6E5D53] hover:bg-[#F4F0EC] hover:text-[#2A1810]"
                          title="Ubah catatan"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="Hapus catatan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
        <CreateEditFertilizationDialog
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          landId={landId}
          initialItem={editingItem}
        />
      )}

      {/* Delete Confirmation */}
      {deletingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingItem(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
            <h4 className="font-heading text-sm font-bold text-[#2A1810]">
              Hapus Catatan Pemupukan?
            </h4>
            <p className="mt-1 text-xs text-[#6E5D53]">
              Catatan pemupukan &ldquo;{deletingItem.jenis_pupuk}&rdquo; ({deletingItem.dosis_kg} kg) akan dihapus.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingItem(null)}
                className="h-8 text-xs border-0 bg-stone-100"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={() => handleDelete(deletingItem.id_pemupukan)}
                disabled={deleteMutation.isPending}
                className="h-8 text-xs bg-red-600 text-white hover:bg-red-700"
              >
                {deleteMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dialog Component
function CreateEditFertilizationDialog({
  isOpen,
  onClose,
  landId,
  initialItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
  initialItem: Fertilization | null;
}) {
  const isEditing = Boolean(initialItem);
  const [tanggal, setTanggal] = useState(
    () => initialItem ? initialItem.tanggal_aplikasi : new Date().toISOString().split("T")[0],
  );
  const [jenisPupuk, setJenisPupuk] = useState(
    initialItem ? initialItem.jenis_pupuk : "NPK 16-16-16",
  );
  const [dosis, setDosis] = useState(
    initialItem ? String(initialItem.dosis_kg) : "50",
  );
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateFertilization(landId);
  const updateMutation = useUpdateFertilization(landId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const dosisNum = parseFloat(dosis);
    if (isNaN(dosisNum) || dosisNum <= 0) {
      setError("Dosis pupuk harus berupa angka lebih besar dari 0.");
      return;
    }

    const payload: CreateFertilizationInput = {
      tanggal_aplikasi: tanggal,
      jenis_pupuk: jenisPupuk.trim(),
      dosis_kg: dosisNum,
    };

    try {
      if (isEditing && initialItem) {
        await updateMutation.mutateAsync({ id: initialItem.id_pemupukan, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Gagal menyimpan catatan pemupukan.");
      } else {
        setError("Terjadi kesalahan saat menyimpan data.");
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-[0_25px_60px_-15px_rgba(42,24,16,0.25)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#EFECE6] px-6 py-4 bg-white">
          <h3 className="font-heading text-base font-bold text-[#2A1810]">
            {isEditing ? "Ubah Catatan Pemupukan" : "Catat Aplikasi Pemupukan Baru"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-[#8A7669] hover:bg-[#F4F0EC]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Tanggal Aplikasi <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Jenis Pupuk <span className="text-red-500">*</span>
            </label>
            <Input
              value={jenisPupuk}
              onChange={(e) => setJenisPupuk(e.target.value)}
              placeholder="Contoh: NPK 16-16-16, Pupuk Kandang Kambing, Kompos Organik"
              className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Total Dosis Aplikasi (kg) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.1"
              value={dosis}
              onChange={(e) => setDosis(e.target.value)}
              placeholder="Contoh: 50"
              className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
              required
            />
            <p className="mt-1 text-[11px] text-[#8A7669]">
              Total berat pupuk yang ditaburkan/diaplikasikan ke petak kebun.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFECE6]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="h-9 rounded-lg border-0 bg-stone-100 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 gap-2 rounded-lg bg-[#2A1810] text-xs font-medium text-white shadow-sm"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Simpan Aplikasi Pupuk"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
