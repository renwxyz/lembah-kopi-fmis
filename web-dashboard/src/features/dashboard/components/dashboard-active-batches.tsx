import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import type { DashboardBatch } from "../types";

interface DashboardActiveBatchesProps {
  batches: DashboardBatch[];
  isPending: boolean;
}

export function DashboardActiveBatches({
  batches,
  isPending,
}: DashboardActiveBatchesProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm lg:col-span-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground">
            Batch Pascaproses Berjalan
          </h2>
          <p className="text-xs text-muted-foreground">
            Status pengolahan ceri kopi menjadi green bean
          </p>
        </div>

        <Link
          href="/dashboard/lahan"
          className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
        >
          Lihat Semua
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {batches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          {isPending
            ? "Memuat batch pascaproses..."
            : "Belum ada batch pascaproses aktif."}
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {batches.map((batch) => (
            <div
              key={batch.id_batch}
              className="flex flex-col justify-between gap-3 bg-white p-4 transition-colors hover:bg-[#FAF8F5] sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {batch.id_batch}
                  </span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {batch.kode_qr_trace}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Metode:{" "}
                  <span className="font-semibold text-foreground">
                    {batch.metode_proses}
                  </span>{" "}
                  • Input: {formatNumber(batch.total_input_ceri_kg)} Kg
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-left sm:text-right">
                  <span className="inline-block rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                    {batch.status_proses}
                  </span>
                  <p className="mt-0.5 text-[10px] text-[#9E8E82]">
                    Est. Selesai: {formatDate(batch.estimasi_tanggal_selesai)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
