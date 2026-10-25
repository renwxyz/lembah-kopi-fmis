import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend({ request, path: "/cms/agenda" });
}

export async function POST(request: NextRequest) {
  return proxyToBackend({ request, path: "/cms/agenda" });
}
