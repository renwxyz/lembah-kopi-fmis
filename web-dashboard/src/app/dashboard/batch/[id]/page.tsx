import { Suspense, use } from "react";
import { LoaderCircle } from "lucide-react";
import { BatchDetailContent } from "./batch-detail-content";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

function BatchDetailSkeleton() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <LoaderCircle className="h-8 w-8 animate-spin text-[#2A1810]" />
      <p className="text-xs text-[#8A7669]">Memuat data batch pascaproses...</p>
    </div>
  );
}

function BatchDetailLoader({ params }: PageProps) {
  const { id } = use(params);
  return <BatchDetailContent id={id} />;
}

export default function BatchDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<BatchDetailSkeleton />}>
      <BatchDetailLoader params={params} />
    </Suspense>
  );
}

