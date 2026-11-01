import "server-only";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { backendFetch, withBearerToken } from "./backend-client";
import { responseFromUpstream, upstreamUnavailableResponse } from "./route-response";
import { SESSION_COOKIE, sessionCookieOptions } from "./session";

interface ProxyToBackendOptions {
  request: NextRequest;
  path: string;
  init?: RequestInit;
}

export async function proxyToBackend({
  request,
  path,
  init = {},
}: ProxyToBackendOptions): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { title: "Tidak terautentikasi", status: 401 },
      { status: 401 },
    );
  }

  try {
    const method = init.method ?? request.method;
    const headers = new Headers(init.headers);

    const contentType = request.headers.get("content-type");
    if (contentType && !headers.has("Content-Type")) {
      headers.set("Content-Type", contentType);
    }

    let body: BodyInit | null | undefined = init.body;
    if (body === undefined && method !== "GET" && method !== "HEAD") {
      try {
        if (contentType && contentType.includes("multipart/form-data")) {
          const formData = await request.formData();
          body = formData;
          // Hapus header Content-Type agar fetch otomatis menetapkan multipart boundary yang valid
          headers.delete("Content-Type");
        } else {
          const text = await request.text();
          if (text) {
            body = text;
          }
        }
      } catch {
        // body was already read or empty
      }
    }

    const upstream = await backendFetch(
      path,
      withBearerToken(token, {
        ...init,
        method,
        headers,
        body,
      }),
    );
    const response = await responseFromUpstream(upstream);

    if (upstream.status === 401) {
      response.cookies.set(SESSION_COOKIE, "", {
        ...sessionCookieOptions,
        maxAge: 0,
      });
    }

    return response;
  } catch (err) {
    console.error(`[BFF Proxy Error] Gagal meneruskan ${request.method} ke ${path}:`, err);
    return upstreamUnavailableResponse();
  }
}
