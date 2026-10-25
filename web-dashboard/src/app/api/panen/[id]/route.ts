import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend({
    request,
    path: `/panen/${encodeURIComponent(id)}`,
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend({
    request,
    path: `/panen/${encodeURIComponent(id)}`,
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyToBackend({
    request,
    path: `/panen/${encodeURIComponent(id)}`,
  });
}

