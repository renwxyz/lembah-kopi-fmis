"use client";

import dynamic from "next/dynamic";
import { ChevronDown, Maximize2 } from "lucide-react";
import type { DashboardMapLand } from "@/features/dashboard/types";

const DashboardMap = dynamic(() => import("./dashboard-map"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#F9F8F6] text-xs font-medium text-muted-foreground">
      Memuat Peta GIS...
    </div>
  ),
});

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
        -mx-4 -mt-4
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
        <div className="absolute inset-0 [&>*]:!h-full [&>*]:!w-full [&_.leaflet-container]:!rounded-none">
          <DashboardMap lands={lands} />
        </div>

        <button
          type="button"
          onClick={onToggleSummary}
          aria-label={
            isSummaryHidden
              ? "Tampilkan ringkasan operasional"
              : "Buka peta layar penuh"
          }
          aria-expanded={!isSummaryHidden}
          className="
            absolute bottom-6 left-1/2 z-[1000]
            flex -translate-x-1/2 items-center gap-2
            rounded-full border border-white/80
            bg-white/95 px-4 py-2 text-xs font-semibold text-foreground
            shadow-lg shadow-black/15
            backdrop-blur-md
            transition-all duration-200
            hover:scale-105 hover:bg-white
            active:scale-95
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary
          "
        >
          {isSummaryHidden ? (
            <>
              <ChevronDown className="h-4 w-4 text-primary" />
              <span>Buka Ringkasan</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5 text-primary" />
              <span>Peta Layar Penuh</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
