import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { title: "Bad Request", status: 400, detail: "Format request body tidak valid" },
      { status: 400 },
    );
  }

  return proxyToBackend({
    request,
    path: `/lahan/${encodeURIComponent(id)}/polygon`,
    init: {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return proxyToBackend({
    request,
    path: `/lahan/${encodeURIComponent(id)}/polygon`,
    init: {
      method: "DELETE",
    },
  });
}

