import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

const allowedSearchParams = ["farmer_id", "search", "page", "page_size"];

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const searchParams = new URLSearchParams();
  for (const key of allowedSearchParams) {
    const value = requestUrl.searchParams.get(key);
    if (value) searchParams.set(key, value);
  }

  const query = searchParams.size ? `?${searchParams}` : "";
  return proxyToBackend({ request, path: `/lahan${query}` });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { title: "Bad Request", status: 400, detail: "Format request body tidak valid" },
      { status: 400 },
    );
  }

  return proxyToBackend({
    request,
    path: "/lahan",
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  });
}
