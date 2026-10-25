"use client";

import Link from "next/link";
import { LoaderCircle, QrCode } from "lucide-react";
import { BatchTraceabilityCard } from "@/features/batch/components/batch-traceability-card";
import { useBatchDetail } from "@/features/batch/hooks/use-batch";

interface TracePublicContentProps {
  id: string;
}

export function TracePublicContent({ id }: TracePublicContentProps) {
  const { data: batch, isLoading, isError } = useBatchDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#2A1810]" />
        <p className="text-xs text-[#8A7669]">Memverifikasi keaslian batch Lembah Kopi...</p>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
        <QrCode className="mx-auto h-12 w-12 text-[#8A7669]" />
        <h2 className="mt-3 font-heading text-lg font-bold text-[#2A1810]">
          Sertifikat Traceability Tidak Ditemukan
        </h2>
        <p className="mt-1 text-xs text-[#8A7669]">
          Kode batch &quot;{id}&quot; tidak terdaftar pada sistem informasi Lembah Kopi Glodogan.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white"
        >
          Masuk ke Portal FMIS
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BatchTraceabilityCard batch={batch} />
    </div>
  );
}

