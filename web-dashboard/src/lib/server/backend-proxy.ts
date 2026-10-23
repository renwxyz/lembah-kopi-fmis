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
    const upstream = await backendFetch(path, withBearerToken(token, init));
    const response = await responseFromUpstream(upstream);

    if (upstream.status === 401) {
      response.cookies.set(SESSION_COOKIE, "", {
        ...sessionCookieOptions,
        maxAge: 0,
      });
    }

    return response;
  } catch {
    return upstreamUnavailableResponse();
  }
}
