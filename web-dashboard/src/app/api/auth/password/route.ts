import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

export async function PUT(request: NextRequest) {
  return proxyToBackend({
    request,
    path: `/auth/password`,
  });
}

