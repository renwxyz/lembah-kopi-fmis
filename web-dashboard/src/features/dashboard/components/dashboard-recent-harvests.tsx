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
    <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-heading text-base font-bold text-foreground">
          Setoran Panen Terbaru
        </h2>
        <p className="text-xs text-muted-foreground">
          Daftar penimbangan ceri kopi masuk dari petani
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-[#FAF8F5] text-muted-foreground">
            <tr>
              <th className="p-3.5 font-semibold">TGL PANEN</th>
              <th className="p-3.5 font-semibold">PETANI</th>
              <th className="p-3.5 font-semibold">PETAK LAHAN</th>
              <th className="p-3.5 font-semibold">VARIETAS</th>
              <th className="p-3.5 font-semibold">BERAT (KG)</th>
              <th className="p-3.5 font-semibold">STATUS ALOKASI</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground">
            {harvests.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[#9E8E82]">
                  {isPending
                    ? "Memuat data panen..."
                    : "Belum ada catatan setoran panen tercatat."}
                </td>
              </tr>
            ) : (
              harvests.map((row) => (
                <tr
                  key={row.id_panen}
                  className="transition-colors hover:bg-[#FAF8F5]"
                >
                  <td className="p-3.5 font-medium">
                    {formatDate(row.tanggal_panen)}
                  </td>
                  <td className="p-3.5 font-semibold">{row.nama_petani}</td>
                  <td className="p-3.5 text-muted-foreground">{row.nama_petak}</td>
                  <td className="p-3.5 text-muted-foreground">{row.varietas}</td>
                  <td className="p-3.5 font-bold">
                    {formatNumber(row.berat_ceri_kg)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-semibold ${
                        row.status_alokasi === "UNPROCESSED"
                          ? "border border-stone-200 bg-stone-100 text-stone-700"
                          : row.status_alokasi === "PARTIAL"
                            ? "border border-amber-200 bg-amber-50 text-amber-800"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-800"
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
