import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDate, formatHandlingStatus, formatSeverity } from "@/lib/format";
import type { DashboardFarmAlert } from "../types";

interface DashboardFarmAlertsProps {
  alerts: DashboardFarmAlert[];
  isPending: boolean;
}

export function DashboardFarmAlerts({
  alerts,
  isPending,
}: DashboardFarmAlertsProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-danger" />
        <h2 className="font-heading text-base font-bold text-foreground">
          Peringatan Kebun
        </h2>
      </div>

      <p className="text-xs text-muted-foreground">
        Insiden hama dan catatan kondisi lahan yang memerlukan perhatian.
      </p>

      <div className="space-y-3 pt-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-success/25 bg-success-tint/50 p-6 text-center">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-xs font-semibold text-success-ink">
              Kondisi Kebun Aman
            </p>
            <p className="text-[11px] text-success-ink">
              {isPending
                ? "Memeriksa status insiden..."
                : "Tidak ada insiden hama aktif saat ini."}
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id_insiden}
              className="space-y-1.5 rounded-xl border border-danger/25 bg-danger-tint/50 p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground">
                  {alert.nama_petak}
                </span>
                <span className="text-[10px] text-text-muted">
                  {formatDate(alert.tanggal_ditemukan)}
                </span>
              </div>

              <p className="text-xs font-semibold text-danger">
                {alert.jenis_hama_penyakit}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Status: {formatHandlingStatus(alert.status_penanganan)} (Tingkat{" "}
                {formatSeverity(alert.tingkat_serangan)})
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
