import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type { DashboardOverview } from "./types";

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await fetch("/api/dashboard/overview");
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<DashboardOverview>;
  return payload.data;
}
