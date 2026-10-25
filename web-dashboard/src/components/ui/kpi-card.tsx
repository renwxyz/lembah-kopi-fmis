import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  unit?: string;
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  description,
  isLoading = false,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] transition-all hover:shadow-[0_6px_24px_-4px_rgba(42,24,16,0.1)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-[#6E5D53]">{title}</p>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F0EC] text-[#2A1810]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-[#2A1810] sm:text-3xl">
            {isLoading ? "—" : value}
          </span>
          {unit && !isLoading && (
            <span className="text-xs font-semibold text-[#6E5D53]">
              {unit}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-[#8A7669]">{description}</p>
        )}
      </div>
    </div>
  );
}

