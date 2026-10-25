import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const search = requestUrl.search;
  return proxyToBackend({
    request,
    path: `/batch${search}`,
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend({
    request,
    path: `/batch`,
  });
}

