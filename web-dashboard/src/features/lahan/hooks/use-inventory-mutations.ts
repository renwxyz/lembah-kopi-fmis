import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLahanInventory,
  deleteInventory,
  deleteLahan,
  setInventoryPopulation,
} from "../api";
import { lahanKeys } from "./use-lahan-list";
import type { CreateInventoryInput } from "../types";

export function useCreateLahanInventory(landId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInventoryInput) =>
      createLahanInventory(landId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lahanKeys.inventory(landId) });
      queryClient.invalidateQueries({ queryKey: lahanKeys.population(landId) });
      queryClient.invalidateQueries({ queryKey: lahanKeys.detail(landId) });
      queryClient.invalidateQueries({ queryKey: lahanKeys.lists() });
    },
  });
}

export function useSetInventoryPopulation(landId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inventoryId,
      treeCount,
    }: {
      inventoryId: string;
      treeCount: number;
    }) => setInventoryPopulation(inventoryId, treeCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lahanKeys.population(landId) });
      queryClient.invalidateQueries({ queryKey: lahanKeys.detail(landId) });
      queryClient.invalidateQueries({ queryKey: lahanKeys.lists() });
    },
  });
}

export function useDeleteInventory(landId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventoryId: string) => deleteInventory(inventoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lahanKeys.inventory(landId) });
      queryClient.invalidateQueries({ queryKey: lahanKeys.population(landId) });
      queryClient.invalidateQueries({ queryKey: lahanKeys.detail(landId) });
      queryClient.invalidateQueries({ queryKey: lahanKeys.lists() });
    },
  });
}

export function useDeleteLahan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLahan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lahanKeys.all });
    },
  });
}

