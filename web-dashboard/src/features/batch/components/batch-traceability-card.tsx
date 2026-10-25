"use client";

import {
  QrCode,
  MapPin,
  User,
  Trees,
  Activity,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import { useBatchTraceability } from "../hooks/use-batch";
import type { ProcessingBatch } from "../types";

interface BatchTraceabilityCardProps {
  batch: ProcessingBatch;
}

export function BatchTraceabilityCard({ batch }: BatchTraceabilityCardProps) {
  const { data: traceData, isLoading, isError } = useBatchTraceability(batch.id_batch);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        <span className="text-xs text-[#8A7669]">Menghimpun silsilah traceability kebun...</span>
      </div>
    );
  }

  if (isError || !traceData) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        <p className="text-xs text-[#8A7669]">
          Data penelusuran (traceability) belum dapat dimuat. Pastikan panen telah dialokasikan ke batch ini.
        </p>
      </div>
    );
  }

  const origins = traceData.asal_panen ?? [];

  return (
    <div className="space-y-6">
      {/* Traceability Hero Certificate Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#2A1810] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#FAF8F5]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-[#FAF8F5]">
                KODE TRACE: {batch.kode_qr_trace}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Terverifikasi Glodogan
              </span>
            </div>

            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Matriks Penelusuran Asal Lahan (Traceability)
            </h2>
            <p className="max-w-xl text-xs text-[#C4B7AC]">
              Silsilah lengkap asal-usul ceri kopi dari petak kebun petani lereng Gunung Sindoro/Sumbing, data varietas pohon, serta riwayat parameter nutrisi tanah 6-in-1.
            </p>
          </div>

          {/* QR Code Presentation Box */}
          <div className="flex shrink-0 items-center gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white p-2 text-[#2A1810]">
              <QrCode className="h-full w-full" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#C4B7AC]">
                QR Tag Pascaproses
              </p>
              <p className="font-mono text-xs font-semibold text-white">
                {batch.id_batch}
              </p>
              <a
                href={`/trace/${encodeURIComponent(batch.kode_qr_trace)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-[11px] font-semibold text-amber-300 underline hover:text-amber-200"
              >
                Buka Halaman Publik &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Quick Batch Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4 text-xs">
          <div>
            <span className="text-[#C4B7AC]">Metode Olah</span>
            <p className="font-heading text-sm font-bold text-white">
              {batch.metode_proses}
            </p>
          </div>
          <div>
            <span className="text-[#C4B7AC]">Input Ceri Kopi</span>
            <p className="font-heading text-sm font-bold text-white">
              {formatNumber(batch.total_input_ceri_kg)} kg
            </p>
          </div>
          <div>
            <span className="text-[#C4B7AC]">Output Green Bean</span>
            <p className="font-heading text-sm font-bold text-white">
              {batch.berat_green_bean_kg !== null && batch.berat_green_bean_kg !== undefined
                ? `${formatNumber(batch.berat_green_bean_kg)} kg`
                : "—"}
            </p>
          </div>
          <div>
            <span className="text-[#C4B7AC]">Rendemen Olahan</span>
            <p className="font-heading text-sm font-bold text-amber-300">
              {batch.rendemen_persen !== null && batch.rendemen_persen !== undefined
                ? `${batch.rendemen_persen.toFixed(1)}%`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Origin Lands Timeline / Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#2A1810]">
            Kebun Asal & Komposisi Panen ({origins.length} Petak)
          </h3>
        </div>

        {origins.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-xs text-[#8A7669] shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
            Belum ada ceri panen yang dimasukkan ke batch ini. Klik tombol &quot;Kelola Alokasi Ceri&quot; di atas untuk menghubungkan panen.
          </div>
        ) : (
          <div className="space-y-4">
            {origins.map((origin, index) => {
              const latestSoil = origin.histori_kondisi_tanah?.[0];

              return (
                <div
                  key={`${origin.alokasi.id_mapping}-${index}`}
                  className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] space-y-4"
                >
                  {/* Top Bar: Petak Lahan & Petani */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#F4F0EC] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#2A1810]">
                        <MapPin className="h-5 w-5 text-[#8A7669]" />
                      </div>
                      <div>
                        <h4 className="font-heading text-sm font-bold text-[#2A1810]">
                          {origin.lahan.nama_petak} ({origin.lahan.dusun})
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#8A7669]">
                          <User className="h-3.5 w-3.5" />
                          <span>{origin.petani.nama_lengkap}</span>
                          {origin.petani.no_hp && (
                            <span>• {origin.petani.no_hp}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8A7669]">
                        Kontribusi Ceri
                      </span>
                      <p className="font-heading text-sm font-bold text-emerald-800">
                        {formatNumber(origin.alokasi.berat_digunakan_kg)} kg
                      </p>
                    </div>
                  </div>

                  {/* Middle: Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                    <div className="space-y-1">
                      <span className="text-[#8A7669] flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Tanggal Petik
                      </span>
                      <p className="font-medium text-[#2A1810]">
                        {formatDate(origin.panen.tanggal_panen)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[#8A7669] flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> Metode Petik
                      </span>
                      <p className="font-medium text-[#2A1810]">
                        {origin.panen.metode_petik === "PETIK_MERAH"
                          ? "Petik Merah (Super)"
                          : "Petik Pelangi"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[#8A7669] flex items-center gap-1">
                        <Trees className="h-3.5 w-3.5" /> Varietas Tanaman
                      </span>
                      <p className="font-medium text-[#2A1810]">
                        {origin.panen.varietas}
                        {origin.inventaris?.kelompok_usia && (
                          <span className="block text-[10px] text-[#8A7669]">
                            {origin.inventaris.kelompok_usia.replace(/_/g, " ")}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[#8A7669] flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" /> Elevasi Kebun
                      </span>
                      <p className="font-medium text-[#2A1810]">
                        {origin.lahan.elevasi_mdpl
                          ? `${origin.lahan.elevasi_mdpl} mdpl`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Soil Health Profile Snapshot (6-in-1 Analyzer) */}
                  {latestSoil && (
                    <div className="rounded-xl bg-[#FAF8F5] p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#2A1810]">
                        <Activity className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Kondisi Tanah Lahan Saat Siklus Tumbuh:</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-[11px] text-[#6E5D53]">
                        <div>
                          pH: <strong className="text-[#2A1810]">{latestSoil.ph_tanah.toFixed(1)}</strong>
                        </div>
                        <div>
                          Kelembapan: <strong className="text-[#2A1810]">{latestSoil.kelembapan}%</strong>
                        </div>
                        {latestSoil.suhu_celsius && (
                          <div>
                            Suhu: <strong className="text-[#2A1810]">{latestSoil.suhu_celsius}°C</strong>
                          </div>
                        )}
                        {latestSoil.ec_value && (
                          <div>
                            EC: <strong className="text-[#2A1810]">{latestSoil.ec_value} µS/cm</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
