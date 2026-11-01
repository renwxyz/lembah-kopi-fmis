import Link from "next/link";
import { Compass, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F8F6] px-4 py-12 text-center sm:px-6 lg:px-8">
      {/* Decorative ambient blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-64 w-64 rounded-full bg-[#2A1810]/5 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_4px_24px_-4px_rgba(42,24,16,0.08)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#2A1810]">
          <Compass className="h-7 w-7 text-[#8A7669]" />
        </div>

        <span className="mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-wider text-[#8A7669]">
          Error 404
        </span>

        <h1 className="mt-1 font-heading text-xl font-bold tracking-tight text-[#2A1810] sm:text-2xl">
          Halaman Tidak Ditemukan
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-[#6E5D53]">
          Halaman, petak kebun, atau tautan yang Anda cari tidak tersedia di sistem informasi perkebunan Lembah Kopi.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#3D2318] shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            Ke Dashboard
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] px-4 py-2.5 text-xs font-semibold text-[#6E5D53] transition-colors hover:bg-[#F4F0EC] hover:text-[#2A1810]"
          >
            <ArrowLeft className="h-4 w-4" />
            Halaman Masuk
          </Link>
        </div>
      </div>

      <p className="relative z-10 mt-8 text-[11px] text-[#9E8E82]">
        &copy; 2026 Lembah Kopi Glodogan &bull; Farm Management Information System
      </p>
    </div>
  );
}
