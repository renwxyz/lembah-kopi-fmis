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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F5] px-4 py-12 text-center sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-64 w-64 rounded-full bg-red-500/10 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#E8E2DC] bg-white p-8 shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>

        <span className="mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-wider text-red-600">
          Terjadi Gangguan
        </span>

        <h1 className="mt-1 font-heading text-xl font-bold tracking-tight text-[#2A1810] sm:text-2xl">
          Gagal Memuat Halaman
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-[#6E5D53]">
          Terjadi kendala sementara saat memuat profil komunitas. Silakan coba muat ulang atau kembali ke beranda.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#3D2318] shadow-sm cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] px-4 py-2.5 text-xs font-semibold text-[#6E5D53] transition-colors hover:bg-[#F4F0EC] hover:text-[#2A1810]"
          >
            <Home className="h-4 w-4" />
            Ke Beranda
          </Link>
        </div>
      </div>

      <p className="relative z-10 mt-8 text-[11px] text-[#9E8E82]">
        &copy; 2026 Lembah Kopi Desa Glodogan &bull; Profil Komunitas Tani
      </p>
    </div>
  );
}

