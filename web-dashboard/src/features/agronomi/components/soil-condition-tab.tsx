"use client";

import { useState } from "react";
import {
  Activity,
  Plus,
  Calendar,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatNumber } from "@/lib/format";
import { ApiError } from "@/lib/api-error";
import {
  useCreateSoilCondition,
  useFertilizationList,
  useSoilConditionList,
} from "../hooks/use-agronomi";
import type { CreateSoilConditionInput, TahapPemantauan } from "../types";

interface SoilConditionTabProps {
  landId: string;
}

export function SoilConditionTab({ landId }: SoilConditionTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: logs = [], isLoading, isError, refetch } = useSoilConditionList(landId);

  // Compute latest and averages
  const latestLog = logs[0] || null;
  const avgPH =
    logs.length > 0
      ? logs.reduce((acc, curr) => acc + (curr.ph_tanah ?? 0), 0) /
        logs.filter((l) => l.ph_tanah != null).length
      : null;

  const avgMoisture =
    logs.length > 0
      ? logs.reduce((acc, curr) => acc + (curr.kelembapan ?? 0), 0) /
        logs.filter((l) => l.kelembapan != null).length
      : null;

  return (
    <div className="space-y-6">
      {/* Tab Header & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#2A1810]">
            Sampling Parameter Tanah (6-in-1 Soil Analyzer)
          </h2>
          <p className="mt-0.5 text-xs text-[#6E5D53]">
            Pencatatan pH, kelembapan, suhu, NPK, dan konduktivitas listrik (EC) per petak lahan (M2.1).
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-9 gap-1.5 rounded-lg bg-[#2A1810] px-4 text-xs font-semibold text-white hover:bg-[#3D2317] shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Catat Sampling Tanah
        </Button>
      </div>

      {/* KPI Cards for Soil Health */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white p-4.5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
            Rerata pH Tanah
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-[#2A1810]">
              {avgPH ? formatNumber(avgPH, 1) : "—"}
            </span>
            {avgPH && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  avgPH >= 5.5 && avgPH <= 6.5
                    ? "bg-emerald-50 text-emerald-800"
                    : avgPH < 5.5
                      ? "bg-amber-50 text-amber-800"
                      : "bg-blue-50 text-blue-800"
                }`}
              >
                {avgPH >= 5.5 && avgPH <= 6.5
                  ? "Ideal (Kopi)"
                  : avgPH < 5.5
                    ? "Asam"
                    : "Alkali"}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#6E5D53] block mt-1">
            Target ideal arabika/robusta: 5.5 – 6.5
          </span>
        </div>

        <div className="rounded-xl bg-white p-4.5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
            Kelembapan Tanah
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-heading text-2xl font-bold tracking-tight text-[#2A1810]">
              {avgMoisture ? formatNumber(avgMoisture, 1) : "—"}
            </span>
            <span className="text-xs font-semibold text-[#6E5D53]">%</span>
          </div>
          <span className="text-[11px] text-[#6E5D53] block mt-1">
            Target kelembapan: 50% – 70%
          </span>
        </div>

        <div className="rounded-xl bg-white p-4.5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
            Status NPK Terakhir
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-sm font-bold text-[#2A1810]">
              {latestLog && latestLog.n_value != null
                ? `N:${latestLog.n_value} P:${latestLog.p_value} K:${latestLog.k_value}`
                : "Belum Diukur"}
            </span>
          </div>
          <span className="text-[11px] text-[#6E5D53] block mt-1">
            Satuan kandungan hara: mg/kg
          </span>
        </div>

        <div className="rounded-xl bg-white p-4.5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
          <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
            Konduktivitas (EC)
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-heading text-2xl font-bold tracking-tight text-[#2A1810]">
              {latestLog?.ec_value != null ? latestLog.ec_value : "—"}
            </span>
            <span className="text-xs font-semibold text-[#6E5D53]">µS/cm</span>
          </div>
          <span className="text-[11px] text-[#6E5D53] block mt-1">
            Indikator salinitas & kesuburan ion
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-[#2A1810] border-t-transparent" />
            <p className="mt-2 text-xs text-[#8A7669]">Memuat data kondisi tanah...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-xs font-semibold text-red-600">Gagal memuat log kondisi tanah.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2 h-8 text-xs">
              Coba Lagi
            </Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#8A7669]">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-heading text-sm font-bold text-[#2A1810]">
              Belum Ada Log Pengukuran Tanah
            </h3>
            <p className="mt-1 text-xs text-[#8A7669] max-w-sm mx-auto">
              Gunakan alat 6-in-1 Soil Analyzer untuk mengukur pH, kelembapan, dan NPK pada petak kebun ini.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 h-9 gap-1.5 rounded-lg bg-[#2A1810] text-xs font-semibold text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Catat Sampling Pertama
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F4F0EC] bg-[#FCFBF9] text-[11px] font-semibold text-[#8A7669] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Tanggal Sampling</th>
                  <th className="px-6 py-3.5">pH Tanah</th>
                  <th className="px-6 py-3.5">Kelembapan</th>
                  <th className="px-6 py-3.5">Suhu (°C)</th>
                  <th className="px-6 py-3.5">NPK (mg/kg)</th>
                  <th className="px-6 py-3.5">EC (µS/cm)</th>
                  <th className="px-6 py-3.5">Konteks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0EC]">
                {logs.map((log) => (
                  <tr key={log.id_log_tanah} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#8A7669]" />
                        <span className="font-medium text-[#2A1810]">
                          {formatDate(log.tanggal_ukur)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      {log.ph_tanah != null ? (
                        <span
                          className={`font-heading font-bold text-xs px-2 py-0.5 rounded-md ${
                            log.ph_tanah >= 5.5 && log.ph_tanah <= 6.5
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {formatNumber(log.ph_tanah, 1)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-6 py-3.5">
                      {log.kelembapan != null ? `${formatNumber(log.kelembapan, 1)}%` : "—"}
                    </td>

                    <td className="px-6 py-3.5">
                      {log.suhu_celsius != null ? `${formatNumber(log.suhu_celsius, 1)} °C` : "—"}
                    </td>

                    <td className="px-6 py-3.5 font-mono text-xs text-[#2A1810]">
                      {log.n_value != null ? `N:${log.n_value} P:${log.p_value} K:${log.k_value}` : "—"}
                    </td>

                    <td className="px-6 py-3.5">
                      {log.ec_value != null ? `${log.ec_value}` : "—"}
                    </td>

                    <td className="px-6 py-3.5">
                      {log.tahap_pemantauan ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF8F5] px-2 py-0.5 text-[11px] font-semibold text-[#6E5D53]">
                          {log.tahap_pemantauan === "SEBELUM" ? "Pre-Pemupukan" : "Post-Pemupukan"}
                        </span>
                      ) : (
                        <span className="text-[#8A7669] text-[11px]">Sampling Rutin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <CreateSoilDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          landId={landId}
        />
      )}
    </div>
  );
}

// Dialog Component
function CreateSoilDialog({
  isOpen,
  onClose,
  landId,
}: {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
}) {
  const [tanggalUkur, setTanggalUkur] = useState(() => new Date().toISOString().split("T")[0]);
  const [phTanah, setPhTanah] = useState("6.0");
  const [kelembapan, setKelembapan] = useState("62.5");
  const [suhu, setSuhu] = useState("24.0");
  const [nVal, setNVal] = useState("45");
  const [pVal, setPVal] = useState("25");
  const [kVal, setKVal] = useState("50");
  const [ecVal, setEcVal] = useState("280");
  const [tahap, setTahap] = useState<TahapPemantauan | "">("");
  const [fertilizerId, setFertilizerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateSoilCondition(landId);
  const { data: fertilizations = [] } = useFertilizationList(landId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tahap && !fertilizerId) {
      setError("Pilih sesi aplikasi pemupukan terkait untuk pemantauan Pre/Post-Pemupukan.");
      return;
    }

    const input: CreateSoilConditionInput = {
      tanggal_ukur: new Date(tanggalUkur).toISOString(),
      ph_tanah: phTanah ? Number(phTanah) : null,
      kelembapan: kelembapan ? Number(kelembapan) : null,
      suhu_celsius: suhu ? Number(suhu) : null,
      n_value: nVal ? parseInt(nVal, 10) : null,
      p_value: pVal ? parseInt(pVal, 10) : null,
      k_value: kVal ? parseInt(kVal, 10) : null,
      ec_value: ecVal ? parseInt(ecVal, 10) : null,
      tahap_pemantauan: tahap ? (tahap as TahapPemantauan) : undefined,
      id_pemupukan: tahap && fertilizerId ? fertilizerId : undefined,
    };

    try {
      await createMutation.mutateAsync(input);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Gagal menyimpan data sampling tanah.");
      } else {
        setError("Terjadi kesalahan saat memproses data.");
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-[0_25px_60px_-15px_rgba(42,24,16,0.25)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#EFECE6] px-6 py-4 bg-white">
          <div>
            <h3 className="font-heading text-base font-bold text-[#2A1810]">
              Catat Hasil Sampling Tanah 6-in-1
            </h3>
            <p className="text-xs text-[#6E5D53]">
              Masukkan parameter fisik & nutrisi tanah dari probe analyzer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#8A7669] hover:bg-[#F4F0EC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2A1810] block">
                Tanggal Pengukuran <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={tanggalUkur}
                onChange={(e) => setTanggalUkur(e.target.value)}
                className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2A1810] block">
                Konteks Monitoring
              </label>
              <select
                value={tahap}
                onChange={(e) => {
                  const val = e.target.value as TahapPemantauan | "";
                  setTahap(val);
                  if (val && !fertilizerId && fertilizations.length > 0) {
                    setFertilizerId(fertilizations[0].id_pemupukan);
                  } else if (!val) {
                    setFertilizerId("");
                  }
                }}
                className="mt-1.5 flex h-10 w-full rounded-lg bg-[#FAF8F5] px-3.5 py-2 text-xs font-medium text-[#2A1810] border-0"
              >
                <option value="">Sampling Rutin Berkala</option>
                <option value="SEBELUM">Sebelum Aplikasi Pupuk (Pre)</option>
                <option value="SESUDAH">Setelah Aplikasi Pupuk (Post)</option>
              </select>
            </div>
          </div>

          {tahap && (
            <div>
              <label className="text-xs font-semibold text-[#2A1810] block">
                Terkait Siklus Pemupukan <span className="text-red-500">*</span>
              </label>
              <select
                value={fertilizerId}
                onChange={(e) => setFertilizerId(e.target.value)}
                required
                className="mt-1.5 flex h-10 w-full rounded-lg bg-[#FAF8F5] px-3.5 py-2 text-xs font-medium text-[#2A1810] border-0"
              >
                <option value="">
                  {fertilizations.length === 0
                    ? "Belum ada catatan pemupukan di lahan ini"
                    : "Pilih catatan pemupukan..."}
                </option>
                {fertilizations.map((f) => (
                  <option key={f.id_pemupukan} value={f.id_pemupukan}>
                    {f.jenis_pupuk} ({f.dosis_kg} kg • {formatDate(f.tanggal_aplikasi)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-[#2A1810] block">
                pH Tanah
              </label>
              <Input
                type="number"
                step="0.1"
                value={phTanah}
                onChange={(e) => setPhTanah(e.target.value)}
                placeholder="5.5 - 6.5"
                className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2A1810] block">
                Kelembapan (%)
              </label>
              <Input
                type="number"
                step="0.1"
                value={kelembapan}
                onChange={(e) => setKelembapan(e.target.value)}
                placeholder="60.0"
                className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2A1810] block">
                Suhu (°C)
              </label>
              <Input
                type="number"
                step="0.1"
                value={suhu}
                onChange={(e) => setSuhu(e.target.value)}
                placeholder="24.0"
                className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
              />
            </div>
          </div>

          <div className="rounded-lg bg-[#FAF8F5] p-3.5 space-y-3">
            <span className="text-xs font-semibold text-[#2A1810] block">
              Unsur Hara Tanah (NPK) & Konduktivitas (EC)
            </span>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-[#8A7669] block">Nitrogen (N)</label>
                <Input
                  type="number"
                  value={nVal}
                  onChange={(e) => setNVal(e.target.value)}
                  placeholder="mg/kg"
                  className="mt-1 h-9 rounded-lg bg-white border-0"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8A7669] block">Fosfor (P)</label>
                <Input
                  type="number"
                  value={pVal}
                  onChange={(e) => setPVal(e.target.value)}
                  placeholder="mg/kg"
                  className="mt-1 h-9 rounded-lg bg-white border-0"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8A7669] block">Kalium (K)</label>
                <Input
                  type="number"
                  value={kVal}
                  onChange={(e) => setKVal(e.target.value)}
                  placeholder="mg/kg"
                  className="mt-1 h-9 rounded-lg bg-white border-0"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8A7669] block">EC (µS/cm)</label>
                <Input
                  type="number"
                  value={ecVal}
                  onChange={(e) => setEcVal(e.target.value)}
                  placeholder="µS/cm"
                  className="mt-1 h-9 rounded-lg bg-white border-0"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFECE6]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="h-9 rounded-lg border-0 bg-stone-100 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 gap-2 rounded-lg bg-[#2A1810] text-xs font-medium text-white shadow-sm"
            >
              {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Simpan Sampling
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
