import { Suspense, use } from "react";
import Link from "next/link";
import { LoaderCircle, Sprout, ArrowLeft } from "lucide-react";
import { TracePublicContent } from "./trace-public-content";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

function TracePublicLoader({ params }: PageProps) {
  const { id } = use(params);
  return <TracePublicContent id={id} />;
}

export default function TracePublicPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8">
      {/* Brand Header */}
      <div className="mx-auto max-w-4xl mb-6 flex items-center justify-between border-b border-[#E8E2DC] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2A1810] text-white">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-bold text-[#2A1810]">
              Lembah Kopi Glodogan
            </h1>
            <p className="text-[10px] text-[#6E5D53]">Farm-to-Cup Digital Traceability</p>
          </div>
        </div>

        <Link
          href="/dashboard/traceability"
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#2A1810] shadow-xs hover:bg-[#FAF8F5]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Dashboard
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <LoaderCircle className="h-8 w-8 animate-spin text-[#2A1810]" />
            <p className="text-xs text-[#8A7669]">Memuat penelusuran origin...</p>
          </div>
        }
      >
        <TracePublicLoader params={params} />
      </Suspense>
    </main>
  );
}

