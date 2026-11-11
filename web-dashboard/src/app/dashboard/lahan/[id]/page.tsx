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
      <LoaderCircle className="h-8 w-8 animate-spin text-coffee-900" />
      <p className="text-xs text-text-muted">Memuat profil lengkap lahan...</p>
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

