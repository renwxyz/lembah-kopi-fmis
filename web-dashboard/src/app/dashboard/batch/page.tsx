"use client";

import { useState } from "react";
import {
  Layers,
  Sparkles,
  Scale,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { useBatchList } from "@/features/batch/hooks/use-batch";
import { BatchListTable } from "@/features/batch/components/batch-list-table";
import { CreateBatchDialog } from "@/features/batch/components/create-batch-dialog";

export default function BatchPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data, isLoading } = useBatchList();
  const batches = data?.items ?? [];

  const totalInputCeriKg = batches.reduce(
    (acc, b) => acc + (b.total_input_ceri_kg || 0),
    0,
  );
  const totalGreenBeanKg = batches.reduce(
    (acc, b) => acc + (b.berat_green_bean_kg || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight text-[#2A1810]">
            Manajemen Batch & Tracking Pascaproses
          </h1>
          <p className="mt-1 text-xs text-[#6E5D53]">
            Pengelompokan hasil panen ceri menjadi batch olahan (Natural, Wash, Full Wash, Wine, Honey) dan pelacakan rendemen biji kopi (Modul PRD M3.2 & M3.3).
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#3D251A] shrink-0"
        >
          <Plus className="h-4 w-4" />
          Buka Batch Pascaproses Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Batch Berjalan"
          value={batches.length}
          icon={Layers}
          description="Rantai pemrosesan aktif di stasiun olah"
          isLoading={isLoading}
        />

        <KpiCard
          title="Akumulasi Ceri Masuk"
          value={`${totalInputCeriKg.toLocaleString("id-ID")} kg`}
          icon={Scale}
          description="Total ceri yang dialokasikan ke batch"
          isLoading={isLoading}
        />

        <KpiCard
          title="Output Green Bean"
          value={`${totalGreenBeanKg.toLocaleString("id-ID")} kg`}
          icon={Sparkles}
          description="Biji kopi kering siap distribusi"
          isLoading={isLoading}
        />
      </div>

      {/* Main Batch List Table */}
      <BatchListTable />

      {/* Create Batch Modal */}
      {isCreateModalOpen && (
        <CreateBatchDialog
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}

