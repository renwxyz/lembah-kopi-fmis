import Link from "next/link";
import { Compass, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-4 py-12 text-center sm:px-6 lg:px-8">
      {/* Decorative ambient blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-surface p-8 border border-border sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-50 text-coffee-900">
          <Compass className="h-7 w-7 text-text-muted" />
        </div>

        <span className="mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-wider text-text-muted">
          Error 404
        </span>

        <h1 className="mt-1 font-heading text-xl font-bold tracking-tight text-coffee-900 sm:text-2xl">
          Halaman Tidak Ditemukan
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          Halaman, petak kebun, atau tautan yang Anda cari tidak tersedia di sistem informasi perkebunan Lembah Kopi.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-primary-hover shadow-sm min-h-10"
          >
            <LayoutDashboard className="h-4 w-4" />
            Ke Dashboard
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl bg-cream-50 px-4 py-2.5 text-xs font-semibold text-text-muted transition-colors hover:bg-primary-tint hover:text-coffee-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Halaman Masuk
          </Link>
        </div>
      </div>

      <p className="relative z-10 mt-8 text-[11px] text-text-muted">
        &copy; 2026 Lembah Kopi Glodogan &bull; Farm Management Information System
      </p>
    </div>
  );
}
