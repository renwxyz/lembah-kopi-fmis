import { Suspense, use } from "react";
import Image from "next/image";
import logoGlodogan from "@/assets/logo-glodogan.png";
import Link from "next/link";
import { LoaderCircle, ArrowLeft } from "lucide-react";
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
    <main className="min-h-screen bg-cream-50 p-4 sm:p-8">
      {/* Brand Header */}
      <div className="mx-auto max-w-4xl mb-6 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Image src={logoGlodogan} alt="Logo Kelompok Tani Kopi Glodogan" width={40} height={40} unoptimized className="h-10 w-10" />
          <div>
            <h1 className="font-heading text-base font-bold text-coffee-900">
              Lembah Kopi Glodogan
            </h1>
            <p className="text-[10px] text-text-muted">Farm-to-Cup Digital Traceability</p>
          </div>
        </div>

        <Link
          href="/dashboard/traceability"
          className="flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-coffee-900 hover:bg-primary-tint"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Dashboard
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <LoaderCircle className="h-8 w-8 animate-spin text-coffee-900" />
            <p className="text-xs text-text-muted">Memuat penelusuran origin...</p>
          </div>
        }
      >
        <TracePublicLoader params={params} />
      </Suspense>
    </main>
  );
}

