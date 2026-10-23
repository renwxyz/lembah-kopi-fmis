import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

const allowedSearchParams = ["search", "page", "page_size"];

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const searchParams = new URLSearchParams();
  for (const key of allowedSearchParams) {
    const value = requestUrl.searchParams.get(key);
    if (value) searchParams.set(key, value);
  }

  const query = searchParams.size ? `?${searchParams}` : "";
  return proxyToBackend({ request, path: `/petani${query}` });
}
