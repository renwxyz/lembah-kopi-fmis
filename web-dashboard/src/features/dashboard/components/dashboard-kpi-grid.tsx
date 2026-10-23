import { Users, Map, Sprout, RefreshCw } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { DashboardSummary } from "../types";

interface DashboardKpiGridProps {
  summary?: DashboardSummary;
  isPending: boolean;
}

export function DashboardKpiGrid({ summary, isPending }: DashboardKpiGridProps) {
  const kpiData = [
    {
      title: "Total Petani Aktif",
      value: isPending ? "—" : formatNumber(summary?.total_petani, 0),
      unit: "Orang",
      icon: Users,
      description: "Terdaftar di sistem",
    },
    {
      title: "Luas Lahan Terdata",
      value: isPending
        ? "—"
        : formatNumber(summary ? summary.total_luas_m2 / 10000 : 0, 2),
      unit: "Hektar",
      icon: Map,
      description: "Total akumulasi petak",
    },
    {
      title: "Hasil Panen Bulan Ini",
      value: isPending
        ? "—"
        : formatNumber(summary ? summary.panen_bulan_ini_kg / 1000 : 0, 2),
      unit: "Ton Ceri",
      icon: Sprout,
      description: "Setoran ceri masuk",
    },
    {
      title: "Batch Olah Aktif",
      value: isPending ? "—" : formatNumber(summary?.total_batch_aktif, 0),
      unit: "Batch",
      icon: RefreshCw,
      description: "Dalam proses pascaproses",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((item) => (
        <div
          key={item.title}
          className="flex flex-col justify-between rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              {item.title}
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground">
              <item.icon className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold text-foreground">
                {item.value}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {item.unit}
              </span>
            </div>
            <p className="text-[11px] text-[#9E8E82]">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
