import { useQuery } from "@tanstack/react-query";
import { getFarmers } from "../api";

export const petaniKeys = {
  all: ["petani"] as const,
  list: () => [...petaniKeys.all, "list"] as const,
};

export function usePetaniList() {
  return useQuery({
    queryKey: petaniKeys.list(),
    queryFn: getFarmers,
  });
}

// Alias for backward compatibility
export const useFarmers = usePetaniList;
export const farmerKeys = petaniKeys;
