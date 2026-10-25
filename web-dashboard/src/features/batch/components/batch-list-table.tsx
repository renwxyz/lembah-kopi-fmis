"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Calendar,
  Sparkles,
  ChevronRight,
  Trash2,
  Loader2,
  AlertCircle,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/format";
import { useBatchList, useDeleteBatch } from "../hooks/use-batch";
import type { ProcessingBatch, ProcessingStatus } from "../types";

const statusConfig: Record<
  ProcessingStatus,
  { label: string; bg: string; text: string }
> = {
  FERMENTASI: {
    label: "Fermentasi",
    bg: "bg-amber-50",
    text: "text-amber-800",
  },
  PENGERINGAN: {
    label: "Pengeringan",
    bg: "bg-orange-50",
    text: "text-orange-800",
  },
  HULLING_RESTING: {
    label: "Hulling / Resting",
    bg: "bg-blue-50",
    text: "text-blue-800",
  },
  SELESAI: {
    label: "Selesai",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
  },
};

export function BatchListTable() {
  const [selectedStatus, setSelectedStatus] = useState<ProcessingStatus | "">("");
  const { data, isLoading, isError, refetch } = useBatchList({
    status_proses: selectedStatus || undefined,
  });

  const deleteMutation = useDeleteBatch();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const batches = data?.items ?? [];

  const handleDelete = async (batch: ProcessingBatch) => {
    if (batch.total_input_ceri_kg > 0) {
      alert(
        "Batch ini sudah memiliki alokasi ceri panen. Lepaskan alokasi panen terlebih dahulu sebelum menghapus batch.",
      );
      return;
    }
    if (!confirm(`Hapus batch pascaproses ${batch.id_batch}?`)) return;

    try {
      setDeletingId(batch.id_batch);
      await deleteMutation.mutateAsync(batch.id_batch);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus batch");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
      {/* Top Filter Bar */}
      <div className="flex flex-col gap-3 border-b border-[#F4F0EC] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-[#2A1810]">
            Daftar Batch Pascaproses Biji Kopi
          </h2>
          <p className="mt-0.5 text-xs text-[#8A7669]">
            Pelacakan batch olahan dari ceri basah hingga green bean kering siap distribusi (M3.2).
          </p>
        </div>

        {/* Filter status tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedStatus("")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedStatus === ""
                ? "bg-[#2A1810] text-white shadow-xs"
                : "bg-[#FAF8F5] text-[#6E5D53] hover:bg-[#F4F0EC]"
            }`}
          >
            Semua
          </button>
          {(
            [
              "FERMENTASI",
              "PENGERINGAN",
              "HULLING_RESTING",
              "SELESAI",
            ] as ProcessingStatus[]
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? "bg-[#2A1810] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#6E5D53] hover:bg-[#F4F0EC]"
              }`}
            >
              {statusConfig[st].label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#8A7669]" />
          <span className="ml-2 text-xs text-[#8A7669]">Memuat daftar batch...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-8 w-8 text-amber-600" />
          <p className="mt-2 text-xs font-semibold text-[#2A1810]">
            Gagal memuat data batch pascaproses.
          </p>
          <Button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#2A1810]"
          >
            Coba Lagi
          </Button>
        </div>
      ) : batches.length === 0 ? (
        <div className="py-16 text-center">
          <Layers className="mx-auto h-10 w-10 text-[#C4B7AC]" />
          <h3 className="mt-3 font-heading text-sm font-bold text-[#2A1810]">
            Tidak Ada Batch Ditemukan
          </h3>
          <p className="mt-1 text-xs text-[#8A7669] max-w-sm mx-auto">
            Belum ada batch pengolahan pascaproses kopi. Klik tombol &quot;+ Buka Batch Baru&quot; di atas untuk memulai.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F4F0EC] text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                <th className="pb-3 pr-4">ID Batch & Trace</th>
                <th className="pb-3 px-4">Metode Olah</th>
                <th className="pb-3 px-4">Mulai Olah</th>
                <th className="pb-3 px-4">Input Ceri (kg)</th>
                <th className="pb-3 px-4">Green Bean (kg)</th>
                <th className="pb-3 px-4">Rendemen</th>
                <th className="pb-3 px-4">Tahap Berjalan</th>
                <th className="pb-3 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF8F5]">
              {batches.map((b) => {
                const statusMeta = statusConfig[b.status_proses] || {
                  label: b.status_proses,
                  bg: "bg-slate-50",
                  text: "text-slate-700",
                };

                return (
                  <tr key={b.id_batch} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-[#8A7669]" />
                        <div>
                          <p className="font-mono font-bold text-[#2A1810]">
                            {b.id_batch}
                          </p>
                          <p className="text-[10px] text-[#8A7669] font-mono">
                            {b.kode_qr_trace}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-md bg-[#FAF8F5] px-2.5 py-1 text-xs font-bold text-[#2A1810]">
                        {b.metode_proses}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6E5D53]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#8A7669]" />
                        {formatDate(b.tanggal_mulai_olah)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-heading text-sm font-bold text-[#2A1810]">
                      {formatNumber(b.total_input_ceri_kg)} kg
                    </td>
                    <td className="py-3.5 px-4 font-heading text-sm text-[#2A1810]">
                      {b.berat_green_bean_kg !== null && b.berat_green_bean_kg !== undefined
                        ? `${formatNumber(b.berat_green_bean_kg)} kg`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {b.rendemen_persen !== null && b.rendemen_persen !== undefined ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                          <Sparkles className="h-3 w-3" />
                          {b.rendemen_persen.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[#8A7669]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusMeta.bg} ${statusMeta.text}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/batch/${encodeURIComponent(b.id_batch)}`}
                          className="flex items-center gap-1 rounded-lg bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-[#2A1810] transition-colors hover:bg-[#F4F0EC]"
                        >
                          Kelola & Trace
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>

                        {b.total_input_ceri_kg === 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(b)}
                            disabled={deletingId === b.id_batch}
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                            title="Hapus Batch Kosong"
                          >
                            {deletingId === b.id_batch ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
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
  );
}

