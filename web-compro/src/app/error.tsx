"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error to console
    console.error("Community profile application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-4 py-12 text-center sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-64 w-64 rounded-full bg-danger-tint blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-tint text-danger">
          <AlertCircle className="h-7 w-7" />
        </div>

        <span className="mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-wider text-danger">
          Terjadi Gangguan
        </span>

        <h1 className="mt-1 font-heading text-xl font-bold tracking-tight text-coffee-900 sm:text-2xl">
          Gagal Memuat Halaman
        </h1>

        <p className="mt-2 text-base leading-relaxed text-text-muted">
          Terjadi kendala sementara saat memuat profil komunitas. Silakan coba muat ulang atau kembali ke beranda.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-primary btn-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>

          <Link
            href="/"
            className="btn btn-outline btn-sm"
          >
            <Home className="h-4 w-4" />
            Ke Beranda
          </Link>
        </div>
      </div>

      <p className="relative z-10 mt-8 text-[13px] text-text-muted">
        &copy; 2026 Lembah Kopi Desa Glodogan &bull; Profil Komunitas Tani
      </p>
    </div>
  );
}

