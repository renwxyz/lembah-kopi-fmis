import { useQuery } from "@tanstack/react-query";
import {
  getLahan,
  getLahanDetail,
  getLahanInventory,
  getLahanPopulation,
} from "../api";
import type { GetLahanParams } from "../types";

export const lahanKeys = {
  all: ["lahan"] as const,
  lists: () => [...lahanKeys.all, "list"] as const,
  list: (params: GetLahanParams) => [...lahanKeys.lists(), params] as const,
  details: () => [...lahanKeys.all, "detail"] as const,
  detail: (id: string) => [...lahanKeys.details(), id] as const,
  inventories: () => [...lahanKeys.all, "inventory"] as const,
  inventory: (landId: string) => [...lahanKeys.inventories(), landId] as const,
  populations: () => [...lahanKeys.all, "population"] as const,
  population: (landId: string) => [...lahanKeys.populations(), landId] as const,
};

export function useLahanList(params: GetLahanParams = { page: 1, pageSize: 50 }) {
  return useQuery({
    queryKey: lahanKeys.list(params),
    queryFn: () => getLahan(params),
  });
}

export function useLahanDetail(id: string) {
  return useQuery({
    queryKey: lahanKeys.detail(id),
    queryFn: () => getLahanDetail(id),
    enabled: Boolean(id),
  });
}

export function useLahanPopulation(landId: string) {
  return useQuery({
    queryKey: lahanKeys.population(landId),
    queryFn: () => getLahanPopulation(landId),
    enabled: Boolean(landId),
  });
}

export function useLahanInventory(landId: string) {
  return useQuery({
    queryKey: lahanKeys.inventory(landId),
    queryFn: () => getLahanInventory(landId),
    enabled: Boolean(landId),
  });
}
