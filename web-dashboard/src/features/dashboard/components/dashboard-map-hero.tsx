
"use client";

import dynamic from "next/dynamic";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { DashboardMapLand } from "@/features/dashboard/types";

const DashboardMap = dynamic(
  () => import("./dashboard-map"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-[#F9F8F6] text-xs font-medium text-[#6E5D53]">
        Memuat Peta GIS...
      </div>
    ),
  }
);

interface DashboardMapHeroProps {
  isSummaryHidden: boolean;
  onToggleSummary: () => void;
  lands?: DashboardMapLand[];
}

export function DashboardMapHero({
  isSummaryHidden,
  onToggleSummary,
  lands = [],
}: DashboardMapHeroProps) {
  return (
    <div
      className="
        sticky top-16 z-0
        -mx-6 -mt-6
        sm:-mx-8 sm:-mt-8
        lg:-mx-10 lg:-mt-10
      "
    >
      <div
        className={`
          relative w-full overflow-hidden
          transition-[height,min-height] duration-500 ease-in-out
          ${
            isSummaryHidden
              ? "h-[calc(100dvh-4rem)] min-h-0"
              : "h-[calc(100vh-325px)] min-h-[500px]"
          }
        `}
      >
        <div className="absolute inset-0 [&>*]:!h-full [&>*]:!w-full">
          <DashboardMap lands={lands} />
        </div>

        <button
          type="button"
          onClick={onToggleSummary}
          aria-label={
            isSummaryHidden
              ? "Tampilkan ringkasan operasional"
              : "Sembunyikan ringkasan operasional"
          }
          aria-expanded={!isSummaryHidden}
          title={
            isSummaryHidden
              ? "Tampilkan ringkasan"
              : "Sembunyikan ringkasan"
          }
          className="
            absolute bottom-5 left-1/2 z-[1000]
            flex h-11 w-11 -translate-x-1/2
            items-center justify-center
            rounded-full border border-white/70
            bg-white/95 text-[#2A1810]
            shadow-lg shadow-black/15
            backdrop-blur-md
            transition-all duration-200
            hover:scale-105 hover:bg-white
            active:scale-95
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#2A1810]
            focus-visible:ring-offset-2
          "
        >
          {isSummaryHidden ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
