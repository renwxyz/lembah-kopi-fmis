import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type { FarmerPage } from "./types";

export async function getFarmers(): Promise<FarmerPage> {
  const response = await fetch("/api/petani?page=1&page_size=100");
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<FarmerPage>;
  return payload.data;
}
