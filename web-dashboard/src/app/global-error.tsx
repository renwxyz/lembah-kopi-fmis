"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Root Layout Error]:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#F9F8F6] font-sans antialiased">
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-[0_4px_24px_-4px_rgba(42,24,16,0.08)] sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <span className="mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-wider text-[#DC2626]">
            Kesalahan Kritis
          </span>

          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#2A1810] sm:text-2xl">
            Sistem Mengalami Kendala
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-[#6E5D53]">
            Terjadi kegagalan mendasar pada struktur antarmuka aplikasi. Silakan muat ulang halaman secara penuh.
          </p>

          {error.digest && (
            <div className="mt-3 rounded-lg bg-[#FAF8F5] px-3 py-1.5 font-mono text-[11px] text-[#8A7669]">
              Digest: <span className="text-[#2A1810]">{error.digest}</span>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2A1810] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#3D2318] active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

