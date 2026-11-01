import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addBatchMapping,
  addBatchStage,
  createBatch,
  deleteBatch,
  deleteBatchMapping,
  getBatchDetail,
  getBatchList,
  getBatchMappings,
  getBatchStages,
  getBatchTraceability,
  getProcessingMethods,
  updateBatch,
  updateBatchMapping,
} from "../api";
import type {
  AddMappingInput,
  AddStageInput,
  BatchFilter,
  CreateBatchInput,
  UpdateBatchInput,
  UpdateMappingInput,
} from "../types";

export const batchKeys = {
  all: ["batch"] as const,
  methods: () => [...batchKeys.all, "methods"] as const,
  lists: () => [...batchKeys.all, "list"] as const,
  list: (filter?: BatchFilter) => [...batchKeys.lists(), filter] as const,
  details: () => [...batchKeys.all, "detail"] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
  stages: (id: string) => [...batchKeys.detail(id), "stages"] as const,
  mappings: (id: string) => [...batchKeys.detail(id), "mappings"] as const,
  traceability: (id: string) => [...batchKeys.detail(id), "traceability"] as const,
};

export function useProcessingMethods() {
  return useQuery({
    queryKey: batchKeys.methods(),
    queryFn: getProcessingMethods,
  });
}

export function useBatchList(filter?: BatchFilter) {
  return useQuery({
    queryKey: batchKeys.list(filter),
    queryFn: () => getBatchList(filter),
  });
}

export function useBatchDetail(id: string) {
  return useQuery({
    queryKey: batchKeys.detail(id),
    queryFn: () => getBatchDetail(id),
    enabled: Boolean(id),
  });
}

export function useBatchStages(batchId: string) {
  return useQuery({
    queryKey: batchKeys.stages(batchId),
    queryFn: () => getBatchStages(batchId),
    enabled: Boolean(batchId),
  });
}

export function useBatchMappings(batchId: string) {
  return useQuery({
    queryKey: batchKeys.mappings(batchId),
    queryFn: () => getBatchMappings(batchId),
    enabled: Boolean(batchId),
  });
}

export function useBatchTraceability(batchId: string) {
  return useQuery({
    queryKey: batchKeys.traceability(batchId),
    queryFn: () => getBatchTraceability(batchId),
    enabled: Boolean(batchId),
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBatchInput) => createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBatch(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBatchInput) => updateBatch(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: batchKeys.traceability(id) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAddBatchStage(batchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddStageInput) => addBatchStage(batchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.stages(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAddBatchMapping(batchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddMappingInput) => addBatchMapping(batchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.mappings(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.traceability(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["harvest"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBatchMapping(batchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mappingId,
      input,
    }: {
      mappingId: string;
      input: UpdateMappingInput;
    }) => updateBatchMapping(batchId, mappingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.mappings(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.traceability(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["harvest"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteBatchMapping(batchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mappingId: string) => deleteBatchMapping(batchId, mappingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.mappings(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.traceability(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["harvest"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

