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
    bg: "bg-warning-tint",
    text: "text-warning-ink",
  },
  PENGERINGAN: {
    label: "Pengeringan",
    bg: "bg-warning-tint",
    text: "text-warning-ink",
  },
  HULLING_RESTING: {
    label: "Hulling / Resting",
    bg: "bg-info-tint",
    text: "text-info-ink",
  },
  SELESAI: {
    label: "Selesai",
    bg: "bg-success-tint",
    text: "text-success-ink",
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
    <div className="rounded-2xl bg-surface p-6 border border-border">
      {/* Top Filter Bar */}
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-coffee-900">
            Daftar Batch Pascaproses Biji Kopi
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
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
                ? "bg-primary text-white shadow-xs"
                : "bg-cream-50 text-text-muted hover:bg-primary-tint"
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
                  ? "bg-primary text-white shadow-xs"
                  : "bg-cream-50 text-text-muted hover:bg-primary-tint"
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
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          <span className="ml-2 text-xs text-text-muted">Memuat daftar batch...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-8 w-8 text-warning-ink" />
          <p className="mt-2 text-xs font-semibold text-coffee-900">
            Gagal memuat data batch pascaproses.
          </p>
          <Button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-cream-50 px-3 py-1.5 text-xs text-coffee-900"
          >
            Coba Lagi
          </Button>
        </div>
      ) : batches.length === 0 ? (
        <div className="py-16 text-center">
          <Layers className="mx-auto h-10 w-10 text-text-muted" />
          <h3 className="mt-3 font-heading text-sm font-bold text-coffee-900">
            Tidak Ada Batch Ditemukan
          </h3>
          <p className="mt-1 text-xs text-text-muted max-w-sm mx-auto">
            Belum ada batch pengolahan pascaproses kopi. Klik tombol &quot;+ Buka Batch Baru&quot; di atas untuk memulai.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-text-muted">
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
            <tbody className="divide-y divide-border">
              {batches.map((b) => {
                const statusMeta = statusConfig[b.status_proses] || {
                  label: b.status_proses,
                  bg: "bg-cream-50",
                  text: "text-coffee-900",
                };

                return (
                  <tr key={b.id_batch} className="hover:bg-primary-wash transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-text-muted" />
                        <div>
                          <p className="font-mono font-bold text-coffee-900">
                            {b.id_batch}
                          </p>
                          <p className="text-[10px] text-text-muted font-mono">
                            {b.kode_qr_trace}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-md bg-cream-50 px-2.5 py-1 text-xs font-bold text-coffee-900">
                        {b.metode_proses}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-text-muted" />
                        {formatDate(b.tanggal_mulai_olah)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-heading text-sm font-bold text-coffee-900">
                      {formatNumber(b.total_input_ceri_kg)} kg
                    </td>
                    <td className="py-3.5 px-4 font-heading text-sm text-coffee-900">
                      {b.berat_green_bean_kg !== null && b.berat_green_bean_kg !== undefined
                        ? `${formatNumber(b.berat_green_bean_kg)} kg`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {b.rendemen_persen !== null && b.rendemen_persen !== undefined ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-success-ink">
                          <Sparkles className="h-3 w-3" />
                          {b.rendemen_persen.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
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
                          className="flex items-center gap-1 rounded-lg bg-cream-50 px-3 py-1.5 text-xs font-semibold text-coffee-900 transition-colors hover:bg-primary-tint"
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
                            className="h-8 w-8 text-danger hover:bg-danger-tint hover:text-danger-ink"
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

