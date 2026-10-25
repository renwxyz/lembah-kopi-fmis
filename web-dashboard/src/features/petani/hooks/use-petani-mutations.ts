import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFarmer,
  deleteFarmer,
  updateFarmer,
} from "../api";
import { petaniKeys } from "./use-petani-list";
import type { CreateFarmerInput, UpdateFarmerInput } from "../types";

export function useCreatePetani() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFarmerInput) => createFarmer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petaniKeys.all });
    },
  });
}

export function useUpdatePetani() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFarmerInput;
    }) => updateFarmer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: petaniKeys.all });
      queryClient.invalidateQueries({
        queryKey: petaniKeys.detail(variables.id),
      });
    },
  });
}

export function useDeletePetani() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFarmer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petaniKeys.all });
    },
  });
}

