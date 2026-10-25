import { Suspense, use } from "react";
import { LoaderCircle } from "lucide-react";
import { LahanDetailContent } from "./lahan-detail-content";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

function LahanDetailSkeleton() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <LoaderCircle className="h-8 w-8 animate-spin text-[#2A1810]" />
      <p className="text-xs text-[#8A7669]">Memuat profil lengkap lahan...</p>
    </div>
  );
}

function LahanDetailLoader({ params }: PageProps) {
  const { id } = use(params);
  return <LahanDetailContent id={id} />;
}

export default function LahanDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<LahanDetailSkeleton />}>
      <LahanDetailLoader params={params} />
    </Suspense>
  );
}

