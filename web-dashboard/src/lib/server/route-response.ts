import { NextResponse } from "next/server";

export async function responseFromUpstream(upstream: Response) {
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ?? "application/problem+json",
    },
  });
}

export function upstreamUnavailableResponse() {
  return NextResponse.json(
    {
      type: "about:blank",
      title: "Layanan API tidak tersedia",
      status: 502,
      detail: "Layanan backend tidak dapat dihubungi. Silakan coba lagi.",
    },
    { status: 502 },
  );
}
