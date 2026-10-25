import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createHarvest,
  deleteHarvest,
  getHarvestDetail,
  getHarvestListByLand,
  updateHarvest,
} from "../api";
import type { CreateHarvestInput, HarvestFilter, UpdateHarvestInput } from "../types";

export const harvestKeys = {
  all: ["harvest"] as const,
  lists: () => [...harvestKeys.all, "list"] as const,
  list: (landId: string, filter?: HarvestFilter) =>
    [...harvestKeys.lists(), landId, filter] as const,
  details: () => [...harvestKeys.all, "detail"] as const,
  detail: (id: string) => [...harvestKeys.details(), id] as const,
};

export function useHarvestList(landId: string, filter?: HarvestFilter) {
  return useQuery({
    queryKey: harvestKeys.list(landId, filter),
    queryFn: () => getHarvestListByLand(landId, filter),
    enabled: Boolean(landId),
  });
}

export function useHarvestDetail(id: string) {
  return useQuery({
    queryKey: harvestKeys.detail(id),
    queryFn: () => getHarvestDetail(id),
    enabled: Boolean(id),
  });
}

export function useCreateHarvest(landId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHarvestInput) => createHarvest(landId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: harvestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateHarvest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHarvestInput }) =>
      updateHarvest(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: harvestKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: harvestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteHarvest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHarvest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: harvestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
