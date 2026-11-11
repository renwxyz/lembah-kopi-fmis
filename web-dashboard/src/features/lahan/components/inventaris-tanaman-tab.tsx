"use client";

import { useState } from "react";
import {
  Trees,
  Plus,
  Pencil,
  Trash2,
  Sprout,
  AlertCircle,
  Loader2,
  X,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { ApiError } from "@/lib/api-error";
import { useLahanPopulation } from "../hooks/use-lahan-list";
import {
  useCreateLahanInventory,
  useDeleteInventory,
  useSetInventoryPopulation,
} from "../hooks/use-inventory-mutations";
import type {
  CoffeeVariety,
  PlantAgeGroup,
  TreePopulationItem,
} from "../types";

interface InventarisTanamanTabProps {
  landId: string;
}

const AGE_LABELS: Record<PlantAgeGroup, { label: string; desc: string }> = {
  LIMA_TAHUN_KURANG: {
    label: "< 5 Tahun",
    desc: "Tanaman Belum Menghasilkan (TBM) / Muda",
  },
  LIMA_BELAS_TAHUN_KURANG: {
    label: "5 – 15 Tahun",
    desc: "Tanaman Menghasilkan (TM) Produktif Prima",
  },
  LIMA_BELAS_TAHUN_LEBIH: {
    label: "> 15 Tahun",
    desc: "Tanaman Tua / Butuh Pemangkasan/Rehabilitasi",
  },
};

export function InventarisTanamanTab({ landId }: InventarisTanamanTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TreePopulationItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useLahanPopulation(landId);
  const items = data?.blok ?? [];
  const totalPohon = data?.total_pohon ?? 0;

  // Statistics calculation
  const totalRobusta = items
    .filter((i) => i.varietas === "ROBUSTA")
    .reduce((acc, curr) => acc + curr.jumlah_pohon, 0);

  const totalArabika = items
    .filter((i) => i.varietas === "ARABIKA")
    .reduce((acc, curr) => acc + curr.jumlah_pohon, 0);

  const deleteMutation = useDeleteInventory(landId);

  const handleDelete = async (inventoryId: string) => {
    try {
      await deleteMutation.mutateAsync(inventoryId);
      setDeletingId(null);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-coffee-900">
            Inventarisasi Tanaman & Populasi Pohon (M1.3)
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Pendataan blok varietas kopi, kelompok usia tanam, dan estimasi populasi pohon aktif.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="h-9 gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Blok Tanam
        </Button>
      </div>

      {/* KPI Cards for Inventory */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-surface p-5 border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-text-muted tracking-wider block">
              Total Pohon Lahan
            </span>
            <span className="mt-1 font-heading text-2xl font-bold tracking-tight text-coffee-900 block">
              {formatNumber(totalPohon, 0)}
            </span>
            <span className="text-xs text-text-muted">Pohon tercatat di semua blok</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-tint text-success-ink">
            <Trees className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl bg-surface p-5 border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-text-muted tracking-wider block">
              Populasi Robusta
            </span>
            <span className="mt-1 font-heading text-2xl font-bold tracking-tight text-coffee-900 block">
              {formatNumber(totalRobusta, 0)}
            </span>
            <span className="text-xs text-text-muted">
              {totalPohon > 0
                ? `${Math.round((totalRobusta / totalPohon) * 100)}% dari total pohon`
                : "0%"}
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-tint text-warning-ink">
            <Sprout className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl bg-surface p-5 border border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-text-muted tracking-wider block">
              Populasi Arabika
            </span>
            <span className="mt-1 font-heading text-2xl font-bold tracking-tight text-coffee-900 block">
              {formatNumber(totalArabika, 0)}
            </span>
            <span className="text-xs text-text-muted">
              {totalPohon > 0
                ? `${Math.round((totalArabika / totalPohon) * 100)}% dari total pohon`
                : "0%"}
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info-tint text-info-ink">
            <PieChart className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Inventory List */}
      <div className="overflow-hidden rounded-xl bg-surface border border-border">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2 text-xs text-text-muted">Memuat inventaris tanaman...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-xs font-semibold text-danger">Gagal memuat inventaris tanaman.</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-2 h-8 text-xs rounded-lg"
            >
              Coba Lagi
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cream-50 text-text-muted">
              <Trees className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-heading text-sm font-bold text-coffee-900">
              Belum Ada Blok Tanaman Tercatat
            </h3>
            <p className="mt-1 text-xs text-text-muted max-w-sm mx-auto">
              Petak kebun ini belum memiliki rincian varietas kopi atau estimasi populasi pohon.
            </p>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="mt-4 h-9 gap-1.5 rounded-lg bg-primary text-xs font-semibold text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Catat Blok Tanaman Pertama
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-cream-50 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-6 py-3.5">ID Blok Inventaris</th>
                  <th className="px-6 py-3.5">Varietas Kopi</th>
                  <th className="px-6 py-3.5">Kelompok Usia Tanam</th>
                  <th className="px-6 py-3.5">Estimasi Populasi</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const ageInfo = AGE_LABELS[item.kelompok_usia] || {
                    label: item.kelompok_usia,
                    desc: "",
                  };

                  return (
                    <tr
                      key={item.id_inventaris}
                      className="hover:bg-primary-wash transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-text-muted bg-cream-50 px-2 py-0.5 rounded-md">
                          {item.id_inventaris}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                            item.varietas === "ARABIKA"
                              ? "bg-info-tint text-info-ink"
                              : "bg-warning-tint text-warning-ink"
                          }`}
                        >
                          <Sprout className="h-3.5 w-3.5" />
                          {item.varietas === "ARABIKA" ? "Kopi Arabika" : "Kopi Robusta"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <span className="font-semibold text-coffee-900 block">
                            {ageInfo.label}
                          </span>
                          <span className="text-[11px] text-text-muted">
                            {ageInfo.desc}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-coffee-900">
                            {formatNumber(item.jumlah_pohon, 0)}
                          </span>
                          <span className="text-xs text-text-muted">Pohon</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-primary-tint hover:text-coffee-900 transition-colors"
                            title="Perbarui jumlah pohon"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingId(item.id_inventaris)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-tint hover:text-danger-ink transition-colors"
                            title="Hapus blok tanaman"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Blok Tanam */}
      <CreateInventoryDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        landId={landId}
      />

      {/* Modal Edit Populasi */}
      {editingItem && (
        <EditPopulationDialog
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          landId={landId}
          item={editingItem}
        />
      )}

      {/* Konfirmasi Hapus Blok */}
      {deletingId && (
        <DeleteConfirmDialog
          isOpen={Boolean(deletingId)}
          onClose={() => setDeletingId(null)}
          onConfirm={() => handleDelete(deletingId)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

// Dialog: Create Inventory
function CreateInventoryDialog({
  isOpen,
  onClose,
  landId,
}: {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
}) {
  const [varietas, setVarietas] = useState<CoffeeVariety>("ROBUSTA");
  const [kelompokUsia, setKelompokUsia] =
    useState<PlantAgeGroup>("LIMA_BELAS_TAHUN_KURANG");
  const [jumlahPohon, setJumlahPohon] = useState<string>("1000");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateLahanInventory(landId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const count = Number(jumlahPohon);
    if (isNaN(count) || count <= 0) {
      setError("Jumlah populasi pohon harus berupa angka lebih besar dari 0.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        varietas,
        kelompok_usia: kelompokUsia,
        jumlah_pohon: count,
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Gagal menambahkan blok tanaman.");
      } else {
        setError("Terjadi kesalahan saat menyimpan data.");
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-coffee-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-surface shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4.5 bg-surface">
          <h3 className="font-heading text-base font-bold text-coffee-900">
            Tambah Blok Tanaman Kopi
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-lg p-1 text-text-muted hover:bg-primary-tint"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-danger-tint p-3 text-xs text-danger-ink">
              <AlertCircle className="h-4 w-4 shrink-0 text-danger mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-coffee-900 block">
              Varietas Kopi <span className="text-danger">*</span>
            </label>
            <select
              value={varietas}
              onChange={(e) => setVarietas(e.target.value as CoffeeVariety)}
              className="mt-1.5 flex h-10 w-full rounded-lg bg-cream-50 px-3.5 py-2 text-sm font-medium text-coffee-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <option value="ROBUSTA">Kopi Robusta</option>
              <option value="ARABIKA">Kopi Arabika</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-coffee-900 block">
              Kelompok Usia Tanaman <span className="text-danger">*</span>
            </label>
            <select
              value={kelompokUsia}
              onChange={(e) => setKelompokUsia(e.target.value as PlantAgeGroup)}
              className="mt-1.5 flex h-10 w-full rounded-lg bg-cream-50 px-3.5 py-2 text-sm font-medium text-coffee-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <option value="LIMA_TAHUN_KURANG">
                &lt; 5 Tahun (Tanaman Belum Menghasilkan / Muda)
              </option>
              <option value="LIMA_BELAS_TAHUN_KURANG">
                5 – 15 Tahun (Produktif Prima)
              </option>
              <option value="LIMA_BELAS_TAHUN_LEBIH">
                &gt; 15 Tahun (Tanaman Tua / Perlu Pemangkasan)
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-coffee-900 block">
              Estimasi Populasi Pohon <span className="text-danger">*</span>
            </label>
            <Input
              type="number"
              value={jumlahPohon}
              onChange={(e) => setJumlahPohon(e.target.value)}
              placeholder="Contoh: 1500"
              className="mt-1.5 h-10 rounded-lg bg-cream-50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            <p className="mt-1 text-[11px] text-text-muted">
              Perkiraan jumlah tegakan pohon kopi aktif pada blok/varietas ini.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="h-9 rounded-lg border-0 bg-primary-tint text-xs font-medium text-coffee-900"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 gap-2 rounded-lg bg-primary text-xs font-medium text-white shadow-sm"
            >
              {createMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Simpan Blok Tanaman
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Dialog: Edit Population
function EditPopulationDialog({
  isOpen,
  onClose,
  landId,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
  item: TreePopulationItem;
}) {
  const [treeCount, setTreeCount] = useState<string>(String(item.jumlah_pohon));
  const [error, setError] = useState<string | null>(null);

  const setPopulationMutation = useSetInventoryPopulation(landId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const count = Number(treeCount);
    if (isNaN(count) || count < 0) {
      setError("Jumlah pohon tidak valid.");
      return;
    }

    try {
      await setPopulationMutation.mutateAsync({
        inventoryId: item.id_inventaris,
        treeCount: count,
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Gagal memperbarui populasi pohon.");
      } else {
        setError("Terjadi kesalahan saat memperbarui populasi.");
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-coffee-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-surface shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 bg-surface">
          <h3 className="font-heading text-sm font-bold text-coffee-900">
            Ubah Populasi Pohon ({item.varietas})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-primary-tint"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-danger-tint p-2.5 text-xs text-danger-ink">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-danger mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-coffee-900 block">
              Jumlah Pohon Aktif
            </label>
            <Input
              type="number"
              value={treeCount}
              onChange={(e) => setTreeCount(e.target.value)}
              className="mt-1.5 h-10 rounded-lg bg-cream-50 border-0"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={setPopulationMutation.isPending}
              className="h-8 rounded-lg border-0 bg-primary-tint text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={setPopulationMutation.isPending}
              className="h-8 gap-1.5 rounded-lg bg-primary text-xs font-medium text-white shadow-sm"
            >
              {setPopulationMutation.isPending && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              Perbarui
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Dialog: Delete Confirm
function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-coffee-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-xl bg-surface p-5 shadow-2xl">
        <h4 className="font-heading text-sm font-bold text-coffee-900">
          Hapus Blok Tanaman?
        </h4>
        <p className="mt-1 text-xs text-text-muted">
          Blok inventaris dan estimasi populasi pohon ini akan dihapus dari data lahan.
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="h-8 text-xs border-0 bg-primary-tint"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="h-8 text-xs bg-danger text-white hover:bg-danger"
          >
            {isPending && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
            Hapus Blok
          </Button>
        </div>
      </div>
    </div>
  );
}

