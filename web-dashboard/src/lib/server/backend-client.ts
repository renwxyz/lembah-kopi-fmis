import "server-only";

function getApiBaseUrl() {
  const apiBaseUrl =
    process.env["API_BASE_URL"] ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("API_BASE_URL must be configured on the server.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export function withBearerToken(token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return { ...init, headers };
}
