import { useQuery } from "@tanstack/react-query";
import { getLahan } from "../api";
import type { GetLahanParams } from "../types";

export const lahanKeys = {
  all: ["lahan"] as const,
  list: (params: GetLahanParams) => [...lahanKeys.all, "list", params] as const,
};

export function useLahanList(params: GetLahanParams) {
  return useQuery({
    queryKey: lahanKeys.list(params),
    queryFn: () => getLahan(params),
  });
}
