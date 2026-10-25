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
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-[#2A1810]">
            Setoran Panen Terbaru
          </h2>
          <p className="mt-0.5 text-xs text-[#6E5D53]">
            Daftar penimbangan ceri kopi masuk dari petani
          </p>
        </div>
        <span className="rounded-full bg-[#F4F0EC] px-3 py-1 text-xs font-semibold text-[#6E5D53]">
          {harvests.length} Catatan Panen
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F7F4F0] text-xs font-semibold text-[#6E5D53]">
            <tr>
              <th className="px-5 py-3.5">Tanggal Panen</th>
              <th className="px-5 py-3.5">Petani</th>
              <th className="px-5 py-3.5">Petak Lahan</th>
              <th className="px-5 py-3.5">Varietas</th>
              <th className="px-5 py-3.5">Berat (kg)</th>
              <th className="px-5 py-3.5">Status Alokasi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/[0.04] text-[#2A1810]">
            {harvests.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-[#8A7669]">
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
                  <td className="px-5 py-4 text-xs font-medium text-[#6E5D53]">
                    {formatDate(row.tanggal_panen)}
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#2A1810]">
                    {row.nama_petani}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#6E5D53]">
                    {row.nama_petak}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#6E5D53]">
                    {row.varietas}
                  </td>
                  <td className="px-5 py-4 font-bold text-[#2A1810]">
                    {formatNumber(row.berat_ceri_kg)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status_alokasi === "UNPROCESSED"
                          ? "bg-stone-100 text-stone-700"
                          : row.status_alokasi === "PARTIAL"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-900"
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
