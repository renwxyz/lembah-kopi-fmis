import { useQuery } from "@tanstack/react-query";
import { getFarmers, type GetFarmersOptions } from "../api";

export const petaniKeys = {
  all: ["petani"] as const,
  lists: () => [...petaniKeys.all, "list"] as const,
  list: (options?: GetFarmersOptions) => [...petaniKeys.lists(), options ?? {}] as const,
  details: () => [...petaniKeys.all, "detail"] as const,
  detail: (id: string) => [...petaniKeys.details(), id] as const,
};

export function usePetaniList(options?: GetFarmersOptions) {
  return useQuery({
    queryKey: petaniKeys.list(options),
    queryFn: () => getFarmers(options),
  });
}

// Alias for backward compatibility
export const useFarmers = usePetaniList;
export const farmerKeys = petaniKeys;
