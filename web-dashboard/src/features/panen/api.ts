import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type {
  CreateHarvestInput,
  HarvestFilter,
  HarvestListResponse,
  HarvestLog,
  UpdateHarvestInput,
} from "./types";

export async function getHarvestListByLand(
  landId: string,
  filter?: HarvestFilter,
): Promise<HarvestListResponse> {
  const query = new URLSearchParams();
  if (filter?.page) query.set("page", String(filter.page));
  if (filter?.page_size) query.set("page_size", String(filter.page_size));
  if (filter?.dari) query.set("dari", filter.dari);
  if (filter?.sampai) query.set("sampai", filter.sampai);
  if (filter?.varietas) query.set("varietas", filter.varietas);
  if (filter?.status_alokasi) query.set("status_alokasi", filter.status_alokasi);

  const qs = query.toString();
  const url = `/api/lahan/${encodeURIComponent(landId)}/panen${qs ? `?${qs}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<HarvestListResponse>;
  return payload.data;
}

export async function getHarvestDetail(id: string): Promise<HarvestLog> {
  const response = await fetch(`/api/panen/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<HarvestLog>;
  return payload.data;
}

export async function createHarvest(
  landId: string,
  input: CreateHarvestInput,
): Promise<HarvestLog> {
  const response = await fetch(`/api/lahan/${encodeURIComponent(landId)}/panen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<HarvestLog>;
  return payload.data;
}

export async function updateHarvest(
  id: string,
  input: UpdateHarvestInput,
): Promise<HarvestLog> {
  const response = await fetch(`/api/panen/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<HarvestLog>;
  return payload.data;
}

export async function deleteHarvest(id: string): Promise<void> {
  const response = await fetch(`/api/panen/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await getApiError(response);
  }
}

