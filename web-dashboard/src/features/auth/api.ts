import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type { LoginInput, UserAdmin } from "./types";

export async function login(input: LoginInput): Promise<UserAdmin> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<UserAdmin>;
  return payload.data;
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });

  if (!response.ok) {
    throw await getApiError(response);
  }
}

export async function getSession(): Promise<UserAdmin> {
  const response = await fetch("/api/auth/session");

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<UserAdmin>;
  return payload.data;
}

export async function changePassword(input: {
  password_lama: string;
  password_baru: string;
  konfirmasi_password_baru: string;
}): Promise<void> {
  const response = await fetch("/api/auth/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
}
