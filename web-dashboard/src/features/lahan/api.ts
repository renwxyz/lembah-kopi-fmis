import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type { CreateLahanInput, GetLahanParams, Lahan, LahanPage } from "./types";

export async function getLahan(params: GetLahanParams = {}): Promise<LahanPage> {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 20),
  });

  if (params.search) searchParams.set("search", params.search);
  if (params.farmerId) searchParams.set("farmer_id", params.farmerId);

  const response = await fetch(`/api/lahan?${searchParams}`);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<LahanPage>;
  return payload.data;
}

export async function createLahan(input: CreateLahanInput): Promise<Lahan> {
  const response = await fetch("/api/lahan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Lahan>;
  return payload.data;
}
