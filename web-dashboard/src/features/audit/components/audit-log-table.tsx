"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ScrollText, Search, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/auth/hooks/use-session";
import { useAuditLogs } from "../hooks/use-audit-logs";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_OPTIONS,
  type AuditAction,
  type AuditLog,
} from "../types";

const PAGE_SIZE = 20;

const ACTION_STYLES: Record<AuditAction, string> = {
  CREATE: "bg-success-tint text-success-ink",
  UPDATE: "bg-info-tint text-info-ink",
  DELETE: "bg-danger-tint text-danger-ink",
  CHANGE_PASSWORD: "bg-warning-tint text-warning-ink",
  LOGIN_SUCCESS: "bg-primary-tint text-coffee-900",
  LOGIN_FAILED: "bg-danger-tint text-danger-ink",
};

const selectClassName =
  "h-9 rounded-lg border border-border bg-surface px-3 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-primary/20";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function roleLabel(role: string | null): string {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "ADMIN_KELOMPOK_TANI") return "Pengurus Kelompok Tani";
  return "—";
}

export function AuditLogTable() {
  const sessionQuery = useSession();
  const isSuperAdmin = sessionQuery.data?.role === "SUPER_ADMIN";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [action, setAction] = useState<AuditAction | "">("");
  const [resource, setResource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, isFetching, refetch } = useAuditLogs(
    {
      q: debouncedSearch,
      aksi: action,
      resource,
      from,
      to,
      page,
      page_size: PAGE_SIZE,
    },
    isSuperAdmin,
  );

  if (sessionQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-primary-tint" />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border bg-surface px-6 py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-text-muted" />
        <h3 className="mt-3 font-heading text-sm font-bold text-coffee-900">
          Akses ditolak
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          Audit trail hanya dapat dilihat oleh Super Admin.
        </p>
      </div>
    );
  }

  const items: AuditLog[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilter = Boolean(debouncedSearch || action || resource || from || to);

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setAction("");
    setResource("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari pengguna, resource, ID, atau path…"
            aria-label="Cari audit trail"
            className="h-9 pl-9 text-xs"
          />
        </div>

        <select
          value={action}
          onChange={(event) => {
            setAction(event.target.value as AuditAction | "");
            setPage(1);
          }}
          aria-label="Filter aksi"
          className={selectClassName}
        >
          <option value="">Semua aksi</option>
          {(Object.keys(AUDIT_ACTION_LABELS) as AuditAction[]).map((key) => (
            <option key={key} value={key}>
              {AUDIT_ACTION_LABELS[key]}
            </option>
          ))}
        </select>

        <select
          value={resource}
          onChange={(event) => {
            setResource(event.target.value);
            setPage(1);
          }}
          aria-label="Filter resource"
          className={selectClassName}
        >
          <option value="">Semua resource</option>
          {AUDIT_RESOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
            aria-label="Dari tanggal"
            className={selectClassName}
          />
          <span className="text-xs text-text-muted">s/d</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            aria-label="Sampai tanggal"
            className={selectClassName}
          />
        </div>

        {hasFilter && (
          <Button
            type="button"
            variant="ghost"
            onClick={resetFilters}
            className="h-9 text-xs font-semibold text-text-muted"
          >
            Reset
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-lg bg-primary-tint" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <p className="text-sm font-semibold text-coffee-900">
            Gagal memuat audit trail
          </p>
          <Button
            type="button"
            onClick={() => refetch()}
            className="mt-3 h-9 rounded-lg bg-primary text-xs font-semibold text-white"
          >
            Coba lagi
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <ScrollText className="h-10 w-10 text-text-muted" />
          <p className="mt-3 text-sm font-semibold text-coffee-900">
            {hasFilter ? "Tidak ada aktivitas yang cocok" : "Belum ada aktivitas tercatat"}
          </p>
        </div>
      ) : (
        <div className={cn("overflow-x-auto", isFetching && "opacity-70 transition-opacity")}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-cream-50 text-xs font-semibold uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-6 py-3.5">Waktu</th>
                <th className="px-6 py-3.5">Pengguna</th>
                <th className="px-6 py-3.5">Aksi</th>
                <th className="px-6 py-3.5">Resource</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id_audit} className="transition-colors hover:bg-primary-wash">
                  <td className="whitespace-nowrap px-6 py-3.5 text-text-muted">
                    {formatDateTime(item.waktu)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="block font-semibold text-coffee-900">{item.username}</span>
                    <span className="text-[11px] text-text-muted">{roleLabel(item.peran)}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold",
                        ACTION_STYLES[item.aksi] ?? "bg-primary-tint text-coffee-900",
                      )}
                    >
                      {AUDIT_ACTION_LABELS[item.aksi] ?? item.aksi}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="block font-medium text-coffee-900">{item.resource}</span>
                    {item.resource_id && (
                      <span className="font-mono text-[11px] text-text-muted">
                        {item.resource_id}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        item.status_code >= 400 ? "text-danger" : "text-success-ink",
                      )}
                    >
                      {item.status_code}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-text-muted">
                    {item.ip_address ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-text-muted">
        <span>
          {total} aktivitas · Halaman {Math.min(page, totalPages)} dari {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            aria-label="Halaman sebelumnya"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            aria-label="Halaman berikutnya"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

