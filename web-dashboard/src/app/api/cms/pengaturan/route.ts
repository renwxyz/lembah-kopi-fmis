import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend({ request, path: "/cms/pengaturan" });
}

export async function PUT(request: NextRequest) {
  return proxyToBackend({ request, path: "/cms/pengaturan" });
}
