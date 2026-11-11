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
      <div className="flex items-center justify-center rounded-2xl bg-surface p-12 border border-border">
        <span className="text-xs text-text-muted">Menghimpun silsilah traceability kebun...</span>
      </div>
    );
  }

  if (isError || !traceData) {
    return (
      <div className="rounded-2xl bg-surface p-8 text-center border border-border">
        <p className="text-xs text-text-muted">
          Data penelusuran (traceability) belum dapat dimuat. Pastikan panen telah dialokasikan ke batch ini.
        </p>
      </div>
    );
  }

  const origins = traceData.asal_panen ?? [];

  return (
    <div className="space-y-6">
      {/* Traceability Hero Certificate Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cream-50/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-cream-50">
                KODE TRACE: {batch.kode_qr_trace}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-coffee-900/30 px-2 py-0.5 text-[10px] font-semibold text-sage-300">
                <CheckCircle2 className="h-3 w-3" />
                Terverifikasi Glodogan
              </span>
            </div>

            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Matriks Penelusuran Asal Lahan (Traceability)
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-white/85">
              Silsilah lengkap asal-usul ceri kopi dari petak kebun petani lereng Gunung Sindoro/Sumbing, data varietas pohon, serta riwayat parameter nutrisi tanah 6-in-1.
            </p>
          </div>

          {/* QR Code Presentation Box */}
          <div className="flex shrink-0 items-center gap-4 rounded-xl bg-surface/10 p-4 backdrop-blur-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface p-2 text-coffee-900">
              <QrCode className="h-full w-full" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-sage-300">
                QR Tag Pascaproses
              </p>
              <p className="font-mono text-xs font-semibold text-white">
                {batch.id_batch}
              </p>
              <span className="mt-1 inline-block rounded bg-coffee-900/30 px-2 py-0.5 text-[10px] font-medium text-sage-300">
                Fitur QR Publik (Hold MVP)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Batch Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4 text-xs">
          <div>
            <span className="text-white/80">Metode Olah</span>
            <p className="font-heading text-sm font-bold text-white">
              {batch.metode_proses}
            </p>
          </div>
          <div>
            <span className="text-white/80">Input Ceri Kopi</span>
            <p className="font-heading text-sm font-bold text-white">
              {formatNumber(batch.total_input_ceri_kg)} kg
            </p>
          </div>
          <div>
            <span className="text-white/80">Output Green Bean</span>
            <p className="font-heading text-sm font-bold text-white">
              {batch.berat_green_bean_kg !== null && batch.berat_green_bean_kg !== undefined
                ? `${formatNumber(batch.berat_green_bean_kg)} kg`
                : "—"}
            </p>
          </div>
          <div>
            <span className="text-white/80">Rendemen Olahan</span>
            <p className="font-heading text-sm font-bold text-sage-300">
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
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-coffee-900">
            Kebun Asal & Komposisi Panen ({origins.length} Petak)
          </h3>
        </div>

        {origins.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center text-xs text-text-muted border border-border">
            Belum ada ceri panen yang dimasukkan ke batch ini. Klik tombol &quot;Kelola Alokasi Ceri&quot; di atas untuk menghubungkan panen.
          </div>
        ) : (
          <div className="space-y-4">
            {origins.map((origin, index) => {
              const latestSoil = origin.histori_kondisi_tanah?.[0];

              return (
                <div
                  key={`${origin.alokasi.id_mapping}-${index}`}
                  className="rounded-2xl bg-surface p-5 border border-border space-y-4"
                >
                  {/* Top Bar: Petak Lahan & Petani */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-50 text-coffee-900">
                        <MapPin className="h-5 w-5 text-text-muted" />
                      </div>
                      <div>
                        <h4 className="font-heading text-sm font-bold text-coffee-900">
                          {origin.lahan.nama_petak} ({origin.lahan.dusun})
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <User className="h-3.5 w-3.5" />
                          <span>{origin.petani.nama_lengkap}</span>
                          {origin.petani.no_hp && (
                            <span>• {origin.petani.no_hp}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Kontribusi Ceri
                      </span>
                      <p className="font-heading text-sm font-bold text-success-ink">
                        {formatNumber(origin.alokasi.berat_digunakan_kg)} kg
                      </p>
                    </div>
                  </div>

                  {/* Middle: Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                    <div className="space-y-1">
                      <span className="text-text-muted flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Tanggal Petik
                      </span>
                      <p className="font-medium text-coffee-900">
                        {formatDate(origin.panen.tanggal_panen)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-text-muted flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> Metode Petik
                      </span>
                      <p className="font-medium text-coffee-900">
                        {origin.panen.metode_petik === "PETIK_MERAH"
                          ? "Petik Merah (Super)"
                          : "Petik Pelangi"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-text-muted flex items-center gap-1">
                        <Trees className="h-3.5 w-3.5" /> Varietas Tanaman
                      </span>
                      <p className="font-medium text-coffee-900">
                        {origin.panen.varietas}
                        {origin.inventaris?.kelompok_usia && (
                          <span className="block text-[10px] text-text-muted">
                            {origin.inventaris.kelompok_usia.replace(/_/g, " ")}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-text-muted flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" /> Elevasi Kebun
                      </span>
                      <p className="font-medium text-coffee-900">
                        {origin.lahan.elevasi_mdpl
                          ? `${origin.lahan.elevasi_mdpl} mdpl`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Soil Health Profile Snapshot (6-in-1 Analyzer) */}
                  {latestSoil && (
                    <div className="rounded-xl bg-cream-50 p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-coffee-900">
                        <Activity className="h-3.5 w-3.5 text-success" />
                        <span>Kondisi Tanah Lahan Saat Siklus Tumbuh:</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-[11px] text-text-muted">
                        <div>
                          pH: <strong className="text-coffee-900">{latestSoil.ph_tanah.toFixed(1)}</strong>
                        </div>
                        <div>
                          Kelembapan: <strong className="text-coffee-900">{latestSoil.kelembapan}%</strong>
                        </div>
                        {latestSoil.suhu_celsius && (
                          <div>
                            Suhu: <strong className="text-coffee-900">{latestSoil.suhu_celsius}°C</strong>
                          </div>
                        )}
                        {latestSoil.ec_value && (
                          <div>
                            EC: <strong className="text-coffee-900">{latestSoil.ec_value} µS/cm</strong>
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
