import { formatDate, formatNumber, formatAllocation } from "@/lib/format";
import type { DashboardHarvest } from "../types";

interface DashboardRecentHarvestsProps {
  harvests: DashboardHarvest[];
  isPending: boolean;
}

export function DashboardRecentHarvests({
  harvests,
  isPending,
}: DashboardRecentHarvestsProps) {
  return (
    <div className="space-y-4 rounded-2xl bg-surface p-6 border border-border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-coffee-900">
            Setoran Panen Terbaru
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Daftar penimbangan ceri kopi masuk dari petani
          </p>
        </div>
        <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-semibold text-text-muted">
          {harvests.length} Catatan Panen
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-cream-50 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-5 py-3.5">Tanggal Panen</th>
              <th className="px-5 py-3.5">Petani</th>
              <th className="px-5 py-3.5">Petak Lahan</th>
              <th className="px-5 py-3.5">Varietas</th>
              <th className="px-5 py-3.5">Berat (kg)</th>
              <th className="px-5 py-3.5">Status Alokasi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-coffee-900">
            {harvests.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-text-muted">
                  {isPending
                    ? "Memuat data panen..."
                    : "Belum ada catatan setoran panen tercatat."}
                </td>
              </tr>
            ) : (
              harvests.map((row) => (
                <tr
                  key={row.id_panen}
                  className="transition-colors hover:bg-cream-50"
                >
                  <td className="px-5 py-4 text-xs font-medium text-text-muted">
                    {formatDate(row.tanggal_panen)}
                  </td>
                  <td className="px-5 py-4 font-semibold text-coffee-900">
                    {row.nama_petani}
                  </td>
                  <td className="px-5 py-4 text-xs text-text-muted">
                    {row.nama_petak}
                  </td>
                  <td className="px-5 py-4 text-xs text-text-muted">
                    {row.varietas}
                  </td>
                  <td className="px-5 py-4 font-bold text-coffee-900">
                    {formatNumber(row.berat_ceri_kg)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status_alokasi === "UNPROCESSED"
                          ? "bg-primary-tint text-coffee-900"
                          : row.status_alokasi === "PARTIAL"
                            ? "bg-warning-tint text-warning-ink"
                            : "bg-success-tint text-success-ink"
                      }`}
                    >
                      {formatAllocation(row.status_alokasi)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
