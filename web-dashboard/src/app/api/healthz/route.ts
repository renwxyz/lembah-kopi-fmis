import { NextResponse, connection } from "next/server";

export async function GET() {
  await connection();
  return NextResponse.json(
    {
      status: "UP",
      service: "web-dashboard",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
