import Link from "next/link";
import { Coffee, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-4 py-12 text-center sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary-tint blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-50 text-coffee-900">
          <Coffee className="h-7 w-7 text-primary" />
        </div>

        <span className="mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-wider text-text-muted">
          Error 404
        </span>

        <h1 className="mt-1 font-heading text-xl font-bold tracking-tight text-coffee-900 sm:text-2xl">
          Halaman Tidak Ditemukan
        </h1>

        <p className="mt-2 text-base leading-relaxed text-text-muted">
          Halaman atau tautan yang Anda tuju tidak tersedia atau telah dipindahkan oleh pengurus kelompok tani Lembah Kopi.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/"
            className="btn btn-primary btn-sm"
          >
            <Home className="h-4 w-4" />
            Beranda Profil
          </Link>

          <Link
            href="/#katalog"
            className="btn btn-outline btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Katalog Produk
          </Link>
        </div>
      </div>

      <p className="relative z-10 mt-8 text-[13px] text-text-muted">
        &copy; 2026 Lembah Kopi Desa Glodogan &bull; Profil Komunitas Tani
      </p>
    </div>
  );
}

