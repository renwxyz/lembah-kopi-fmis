"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview";
import { DashboardMapHero } from "@/features/dashboard/components/dashboard-map-hero";
import { DashboardKpiGrid } from "@/features/dashboard/components/dashboard-kpi-grid";
import { DashboardActiveBatches } from "@/features/dashboard/components/dashboard-active-batches";
import { DashboardFarmAlerts } from "@/features/dashboard/components/dashboard-farm-alerts";
import { DashboardRecentHarvests } from "@/features/dashboard/components/dashboard-recent-harvests";

export default function DashboardPage() {
  const [isSummaryHidden, setIsSummaryHidden] = useState(false);
  const overviewQuery = useDashboardOverview();
  const data = overviewQuery.data;

  return (
    <div
      className={`relative isolate ${
        isSummaryHidden ? "pb-0" : "pb-12"
      }`}
    >
      {/* PETA GIS HERO */}
      <DashboardMapHero
        isSummaryHidden={isSummaryHidden}
        onToggleSummary={() => setIsSummaryHidden((hidden) => !hidden)}
        lands={data?.map_lahan}
      />

      {/* RINGKASAN OPERASIONAL */}
      <section
        aria-hidden={isSummaryHidden}
        inert={isSummaryHidden}
        className={`
          relative z-10
          -mx-4 sm:-mx-8 lg:-mx-10
          mt-0
          transition-opacity duration-300 ease-in-out
          ${
            isSummaryHidden
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }
        `}
      >
        {/* GRADASI TRANSISI DARI PETA */}
        <div
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute inset-x-0 bottom-full
            h-16
            bg-gradient-to-b
            from-transparent
            via-[#F9F8F6]/40
            to-[#F9F8F6]
            transition-opacity duration-300
            ${isSummaryHidden ? "opacity-0" : "opacity-100"}
          `}
        />

        {/* ANIMASI BUKA/TUTUP */}
        <div
          className={`
            grid transition-[grid-template-rows] duration-300 ease-in-out
            ${
              isSummaryHidden
                ? "grid-rows-[0fr]"
                : "grid-rows-[1fr]"
            }
          `}
        >
          <div className="min-h-0 overflow-hidden bg-[#F9F8F6] px-4 pb-8 sm:px-8 lg:px-10">
            <div className="space-y-8 pt-4">
              {/* JUDUL DAN TOMBOL AKSI */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    Ringkasan Operasional
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Statistik kebun, proses pengolahan, dan setoran panen
                    terkini.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    onClick={() => void overviewQuery.refetch()}
                    disabled={overviewQuery.isFetching}
                    variant="outline"
                    className="gap-2 text-xs"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        overviewQuery.isFetching ? "animate-spin" : ""
                      }`}
                    />
                    Muat Ulang
                  </Button>

                  <Button
                    asChild
                    variant="default"
                    className="gap-2 text-xs"
                  >
                    <Link href="/dashboard/panen">
                      <Plus className="h-4 w-4" />
                      Catat Panen
                    </Link>
                  </Button>
                </div>
              </div>

              {/* ERROR STATE BANNER */}
              {overviewQuery.isError && (
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-800">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>
                      Gagal mengambil data ringkasan operasional dari server.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void overviewQuery.refetch()}
                    className="font-bold underline hover:no-underline"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* KPI CARDS */}
              <DashboardKpiGrid
                summary={data?.summary}
                isPending={overviewQuery.isPending}
              />

              {/* BATCH BERJALAN DAN PERINGATAN */}
              <div className="grid gap-6 lg:grid-cols-12">
                <DashboardActiveBatches
                  batches={data?.batch_aktif ?? []}
                  isPending={overviewQuery.isPending}
                />
                <DashboardFarmAlerts
                  alerts={data?.peringatan_kebun ?? []}
                  isPending={overviewQuery.isPending}
                />
              </div>

              {/* TABEL SETORAN PANEN TERBARU */}
              <DashboardRecentHarvests
                harvests={data?.panen_terbaru ?? []}
                isPending={overviewQuery.isPending}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
