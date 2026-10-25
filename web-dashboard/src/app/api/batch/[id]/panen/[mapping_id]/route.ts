import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

interface RouteParams {
  params: Promise<{ id: string; mapping_id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id, mapping_id } = await params;
  return proxyToBackend({
    request,
    path: `/batch/${encodeURIComponent(id)}/panen/${encodeURIComponent(mapping_id)}`,
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id, mapping_id } = await params;
  return proxyToBackend({
    request,
    path: `/batch/${encodeURIComponent(id)}/panen/${encodeURIComponent(mapping_id)}`,
  });
}

