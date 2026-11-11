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

/** Kartu ringkasan: radius 16px, garis tepi, ikon dalam lingkaran primary-tint, angka 28px (DESIGN.md 7.2). */
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
        "flex flex-col justify-between rounded-2xl border border-border bg-surface p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-[28px] font-bold leading-tight tracking-tight text-coffee-900">
            {isLoading ? "—" : value}
          </span>
          {unit && !isLoading && (
            <span className="text-sm font-semibold text-text-muted">
              {unit}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}
