"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to client console for telemetry/debugging
    console.error("[Application Runtime Error]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
      {/* Decorative ambient blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-64 w-64 rounded-full bg-danger/5 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-surface p-8 border border-border sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-tint text-danger">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <span className="mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-wider text-danger">
          Terjadi Kendala Sistem
        </span>

        <h1 className="mt-1 font-heading text-xl font-bold tracking-tight text-coffee-900 sm:text-2xl">
          Gagal Memuat Halaman
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          Terjadi kesalahan saat memproses data pada tampilan ini. Silakan coba muat ulang atau kembali ke dashboard utama.
        </p>

        {error.digest && (
          <div className="mt-3 rounded-lg bg-cream-50 px-3 py-1.5 font-mono text-[11px] text-text-muted">
            Kode digest: <span className="text-coffee-900">{error.digest}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-primary-hover shadow-sm active:scale-[0.98] min-h-10"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-cream-50 px-4 py-2.5 text-xs font-semibold text-text-muted transition-colors hover:bg-primary-tint hover:text-coffee-900"
          >
            <LayoutDashboard className="h-4 w-4" />
            Ke Dashboard
          </Link>
        </div>
      </div>

      <p className="relative z-10 mt-8 text-[11px] text-text-muted">
        Lembah Kopi FMIS &bull; Laporkan ke administrator jika kendala terus berulang
      </p>
    </div>
  );
}

