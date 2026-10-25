import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTreatment,
  createFertilization,
  createPestDisease,
  createSoilCondition,
  deleteFertilization,
  deletePestDisease,
  getFertilizationList,
  getPestDiseaseList,
  getSoilConditionList,
  getTreatments,
  updateFertilization,
} from "../api";
import type {
  AddTreatmentInput,
  CreateFertilizationInput,
  CreateIncidentInput,
  CreateSoilConditionInput,
} from "../types";

export const agronomiKeys = {
  all: ["agronomi"] as const,
  soils: () => [...agronomiKeys.all, "soil"] as const,
  soilList: (landId: string) => [...agronomiKeys.soils(), landId] as const,
  fertilizations: () => [...agronomiKeys.all, "fertilization"] as const,
  fertilizationList: (landId: string) =>
    [...agronomiKeys.fertilizations(), landId] as const,
  pests: () => [...agronomiKeys.all, "pest"] as const,
  pestList: (landId: string) => [...agronomiKeys.pests(), landId] as const,
  treatments: (incidentId: string) =>
    [...agronomiKeys.pests(), "treatment", incidentId] as const,
};

// =================== SOIL HOOKS ===================
export function useSoilConditionList(landId: string) {
  return useQuery({
    queryKey: agronomiKeys.soilList(landId),
    queryFn: () => getSoilConditionList(landId),
    enabled: Boolean(landId),
  });
}

export function useCreateSoilCondition(landId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSoilConditionInput) =>
      createSoilCondition(landId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agronomiKeys.soilList(landId),
      });
    },
  });
}

// =================== FERTILIZATION HOOKS ===================
export function useFertilizationList(landId: string) {
  return useQuery({
    queryKey: agronomiKeys.fertilizationList(landId),
    queryFn: () => getFertilizationList(landId),
    enabled: Boolean(landId),
  });
}

export function useCreateFertilization(landId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFertilizationInput) =>
      createFertilization(landId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agronomiKeys.fertilizationList(landId),
      });
    },
  });
}

export function useUpdateFertilization(landId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: CreateFertilizationInput;
    }) => updateFertilization(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agronomiKeys.fertilizationList(landId),
      });
    },
  });
}

export function useDeleteFertilization(landId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFertilization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agronomiKeys.fertilizationList(landId),
      });
    },
  });
}

// =================== PEST & DISEASE HOOKS ===================
export function usePestDiseaseList(landId: string) {
  return useQuery({
    queryKey: agronomiKeys.pestList(landId),
    queryFn: () => getPestDiseaseList(landId),
    enabled: Boolean(landId),
  });
}

export function useCreatePestDisease(landId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIncidentInput) =>
      createPestDisease(landId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agronomiKeys.pestList(landId),
      });
    },
  });
}

export function useDeletePestDisease(landId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePestDisease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agronomiKeys.pestList(landId),
      });
    },
  });
}

export function useTreatmentsList(incidentId: string) {
  return useQuery({
    queryKey: agronomiKeys.treatments(incidentId),
    queryFn: () => getTreatments(incidentId),
    enabled: Boolean(incidentId),
  });
}

export function useAddTreatment(landId: string, incidentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddTreatmentInput) => addTreatment(incidentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agronomiKeys.treatments(incidentId),
      });
      queryClient.invalidateQueries({
        queryKey: agronomiKeys.pestList(landId),
      });
    },
  });
}

