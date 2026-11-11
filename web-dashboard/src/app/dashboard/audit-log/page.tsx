"use client";

import { AuditLogTable } from "@/features/audit/components/audit-log-table";

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight text-coffee-900">
          Audit Trail
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          Riwayat aktivitas admin: siapa melakukan apa pada resource apa, termasuk login gagal.
        </p>
      </div>

      <AuditLogTable />
    </div>
  );
}

