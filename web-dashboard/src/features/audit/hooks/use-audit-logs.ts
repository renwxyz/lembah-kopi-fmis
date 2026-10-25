import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api";
import type { AuditLogFilters } from "../types";

export const auditKeys = {
  all: ["audit-log"] as const,
  list: (filters: AuditLogFilters) => [...auditKeys.all, "list", filters] as const,
};

export function useAuditLogs(filters: AuditLogFilters, enabled = true) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => getAuditLogs(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

