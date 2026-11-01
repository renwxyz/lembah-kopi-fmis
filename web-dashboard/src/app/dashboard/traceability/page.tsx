"use client";

import { useState, useMemo } from "react";
import {
  QrCode,
  Layers,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { useBatchList } from "@/features/batch/hooks/use-batch";
import { BatchTraceabilityCard } from "@/features/batch/components/batch-traceability-card";

export default function TraceabilityPage() {
  const { data: batchData, isLoading } = useBatchList();
  const batches = useMemo(() => batchData?.items ?? [], [batchData]);

  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBatches = useMemo(() => {
    if (!searchTerm.trim()) return batches;
    const q = searchTerm.toLowerCase();
    return batches.filter(
      (b) =>
        b.id_batch.toLowerCase().includes(q) ||
        b.kode_qr_trace.toLowerCase().includes(q) ||
        b.metode_proses.toLowerCase().includes(q),
    );
  }, [batches, searchTerm]);

  const activeBatchId = useMemo(() => {
    if (
      selectedBatchId &&
      filteredBatches.some((b) => b.id_batch === selectedBatchId)
    ) {
      return selectedBatchId;
    }
    return filteredBatches[0]?.id_batch ?? "";
  }, [selectedBatchId, filteredBatches]);

  const currentBatch = useMemo(
    () => filteredBatches.find((b) => b.id_batch === activeBatchId),
    [filteredBatches, activeBatchId],
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight text-[#2A1810]">
          Pusat Penelusuran Asal Lahan (Traceability Matrix)
        </h1>
        <p className="mt-1 text-xs text-[#6E5D53]">
          Verifikasi silsilah rantai pasok kopi dari petak kebun petani lereng Gunung Sindoro/Sumbing, varietas pohon, hingga profil tanah 6-in-1 per batch (Sub-Modul PRD M3.3).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Batch Terdaftar"
          value={batches.length}
          icon={Layers}
          description="Total rantai olah dengan kode unik"
          isLoading={isLoading}
        />

        <KpiCard
          title="Integritas Silsilah"
          value="100%"
          icon={CheckCircle2}
          description="Terhubung ke data GPS & petani"
        />

        <KpiCard
          title="Verifikasi QR Code"
          value="Aktif"
          icon={QrCode}
          description="Matriks penelusuran digital"
        />
      </div>

      {/* Search & Selector Bar */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#2A1810]">
              <QrCode className="h-5 w-5 text-[#8A7669]" />
            </div>
            <div>
              <label htmlFor="select-trace-batch" className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Pilih Batch Olahan Kopi
              </label>
              <div className="mt-0.5 flex items-center gap-2">
                <select
                  id="select-trace-batch"
                  value={activeBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="rounded-lg bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-[#2A1810] outline-none transition-all hover:bg-[#F4F0EC] focus:ring-1 focus:ring-[#2A1810]"
                  disabled={isLoading || batches.length === 0}
                >
                  {filteredBatches.length === 0 && (
                    <option value="">Tidak ada batch cocok</option>
                  )}
                  {filteredBatches.map((b) => (
                    <option key={b.id_batch} value={b.id_batch}>
                      {b.id_batch} — {b.metode_proses} ({b.total_input_ceri_kg} kg ceri)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8A7669]" />
            <Input
              type="text"
              placeholder="Cari ID batch / kode trace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs rounded-xl border-[#E8E2DC]"
            />
          </div>
        </div>
      </div>

      {/* Traceability Viewer */}
      {currentBatch ? (
        <BatchTraceabilityCard batch={currentBatch} />
      ) : (
        <div className="rounded-2xl bg-white p-12 text-center shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <QrCode className="mx-auto h-10 w-10 text-[#8A7669]" />
          <h3 className="mt-3 font-heading text-sm font-bold text-[#2A1810]">
            Tidak Ada Batch Terpilih
          </h3>
          <p className="mt-1 text-xs text-[#8A7669]">
            Buka batch pascaproses terlebih dahulu pada menu Pascaproses & Batch.
          </p>
        </div>
      )}
    </div>
  );
}
