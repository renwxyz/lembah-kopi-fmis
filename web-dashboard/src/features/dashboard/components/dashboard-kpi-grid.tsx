import { Users, Map, Sprout, RefreshCw } from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
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
      value: formatNumber(summary?.total_petani, 0),
      unit: "Orang",
      icon: Users,
      description: "Terdaftar di sistem",
    },
    {
      title: "Luas Lahan Terdata",
      value: formatNumber(summary ? summary.total_luas_m2 / 10000 : 0, 2),
      unit: "Hektar",
      icon: Map,
      description: "Total akumulasi petak",
    },
    {
      title: "Hasil Panen Bulan Ini",
      value: formatNumber(summary ? summary.panen_bulan_ini_kg / 1000 : 0, 2),
      unit: "Ton Ceri",
      icon: Sprout,
      description: "Setoran ceri masuk",
    },
    {
      title: "Batch Olah Aktif",
      value: formatNumber(summary?.total_batch_aktif, 0),
      unit: "Batch",
      icon: RefreshCw,
      description: "Dalam proses pascaproses",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((item) => (
        <KpiCard
          key={item.title}
          title={item.title}
          value={item.value}
          unit={item.unit}
          icon={item.icon}
          description={item.description}
          isLoading={isPending}
        />
      ))}
    </div>
  );
}
