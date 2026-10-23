import { NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/validation";
import type { LoginData } from "@/features/auth/types";
import { backendFetch } from "@/lib/server/backend-client";
import { responseFromUpstream, upstreamUnavailableResponse } from "@/lib/server/route-response";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export async function POST(request: Request) {
  const input = loginSchema.safeParse(await request.json().catch(() => null));

  if (!input.success) {
    return NextResponse.json(
      {
        type: "about:blank",
        title: "Permintaan tidak valid",
        status: 400,
        detail: "Username/email dan password wajib diisi.",
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await backendFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input.data),
    });

    if (!upstream.ok) {
      return responseFromUpstream(upstream);
    }

    const payload = (await upstream.json()) as ApiResponse<LoginData>;
    const response = NextResponse.json({
      success: payload.success,
      message: payload.message,
      data: payload.data.user,
    });
    const expires = new Date(payload.data.expires_at);

    response.cookies.set(SESSION_COOKIE, payload.data.access_token, {
      ...sessionCookieOptions,
      ...(Number.isNaN(expires.getTime()) ? {} : { expires }),
    });

    return response;
  } catch {
    return upstreamUnavailableResponse();
  }
}
