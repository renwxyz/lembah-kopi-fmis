import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type { AuditLogFilters, AuditLogPage } from "./types";

export async function getAuditLogs(
  filters: AuditLogFilters = {},
): Promise<AuditLogPage> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  const query = params.size ? `?${params.toString()}` : "";
  const response = await fetch(`/api/audit-log${query}`);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<AuditLogPage>;
  return payload.data;
}

