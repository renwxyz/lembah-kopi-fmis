import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type {
  AddMappingInput,
  AddStageInput,
  BatchFilter,
  BatchPanenMapping,
  BatchTraceability,
  CreateBatchInput,
  ProcessingBatch,
  ProcessingBatchListResponse,
  ProcessingMethod,
  ProcessingStageRecord,
  UpdateBatchInput,
  UpdateMappingInput,
} from "./types";

interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ------------------------------------------
// Processing Methods
// ------------------------------------------

export async function getProcessingMethods(): Promise<ProcessingMethod[]> {
  const response = await fetch("/api/metode-pascaproses");
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload = (await response.json()) as ApiResponse<ProcessingMethod[]>;
  return payload.data;
}

// ------------------------------------------
// Processing Batches
// ------------------------------------------

export async function getBatchList(
  filter?: BatchFilter,
): Promise<ProcessingBatchListResponse> {
  const query = new URLSearchParams();
  if (filter?.page) query.set("page", String(filter.page));
  if (filter?.page_size) query.set("page_size", String(filter.page_size));
  if (filter?.status_proses) query.set("status_proses", filter.status_proses);
  if (filter?.metode_proses) query.set("metode_proses", filter.metode_proses);

  const qs = query.toString();
  const url = `/api/batch${qs ? `?${qs}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload = (await response.json()) as ApiResponse<ProcessingBatchListResponse>;
  return payload.data;
}

export async function getBatchDetail(id: string): Promise<ProcessingBatch> {
  const response = await fetch(`/api/batch/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload = (await response.json()) as ApiResponse<ProcessingBatch>;
  return payload.data;
}

export async function createBatch(
  input: CreateBatchInput,
): Promise<ProcessingBatch> {
  const response = await fetch("/api/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload = (await response.json()) as ApiResponse<ProcessingBatch>;
  return payload.data;
}

export async function updateBatch(
  id: string,
  input: UpdateBatchInput,
): Promise<ProcessingBatch> {
  const response = await fetch(`/api/batch/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload = (await response.json()) as ApiResponse<ProcessingBatch>;
  return payload.data;
}

export async function deleteBatch(id: string): Promise<void> {
  const response = await fetch(`/api/batch/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await getApiError(response);
  }
}

// ------------------------------------------
// Batch Stages
// ------------------------------------------

export async function getBatchStages(
  batchId: string,
): Promise<ProcessingStageRecord[]> {
  const response = await fetch(
    `/api/batch/${encodeURIComponent(batchId)}/tahap?page=1&page_size=100`,
  );
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload =
    (await response.json()) as ApiResponse<PageResponse<ProcessingStageRecord>>;
  return payload.data.items;
}

export async function addBatchStage(
  batchId: string,
  input: AddStageInput,
): Promise<void> {
  const response = await fetch(
    `/api/batch/${encodeURIComponent(batchId)}/tahap`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) {
    throw await getApiError(response);
  }
}

// ------------------------------------------
// Batch Panen Mappings (Cherry Allocation)
// ------------------------------------------

export async function getBatchMappings(
  batchId: string,
): Promise<BatchPanenMapping[]> {
  const response = await fetch(
    `/api/batch/${encodeURIComponent(batchId)}/panen?page=1&page_size=100`,
  );
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload =
    (await response.json()) as ApiResponse<PageResponse<BatchPanenMapping>>;
  return payload.data.items;
}

export async function addBatchMapping(
  batchId: string,
  input: AddMappingInput,
): Promise<BatchPanenMapping> {
  const response = await fetch(
    `/api/batch/${encodeURIComponent(batchId)}/panen`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload = (await response.json()) as ApiResponse<BatchPanenMapping>;
  return payload.data;
}

export async function updateBatchMapping(
  batchId: string,
  mappingId: string,
  input: UpdateMappingInput,
): Promise<BatchPanenMapping> {
  const response = await fetch(
    `/api/batch/${encodeURIComponent(batchId)}/panen/${encodeURIComponent(mappingId)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload = (await response.json()) as ApiResponse<BatchPanenMapping>;
  return payload.data;
}

export async function deleteBatchMapping(
  batchId: string,
  mappingId: string,
): Promise<void> {
  const response = await fetch(
    `/api/batch/${encodeURIComponent(batchId)}/panen/${encodeURIComponent(mappingId)}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw await getApiError(response);
  }
}

// ------------------------------------------
// Traceability
// ------------------------------------------

export async function getBatchTraceability(
  batchId: string,
): Promise<BatchTraceability> {
  const response = await fetch(
    `/api/batch/${encodeURIComponent(batchId)}/traceability`,
  );
  if (!response.ok) {
    throw await getApiError(response);
  }
  const payload = (await response.json()) as ApiResponse<BatchTraceability>;
  return payload.data;
}

