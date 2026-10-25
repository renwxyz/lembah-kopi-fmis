import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type {
  CreateFarmerInput,
  Farmer,
  FarmerPage,
  UpdateFarmerInput,
} from "./types";

export interface GetFarmersOptions {
  search?: string;
  page?: number;
  page_size?: number;
}

export async function getFarmers(
  options: GetFarmersOptions = {},
): Promise<FarmerPage> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.page) params.set("page", String(options.page));
  params.set("page_size", String(options.page_size ?? 100));

  const response = await fetch(`/api/petani?${params.toString()}`);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<FarmerPage>;
  return payload.data;
}

export async function getFarmer(id: string): Promise<Farmer> {
  const response = await fetch(`/api/petani/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Farmer>;
  return payload.data;
}

export async function createFarmer(input: CreateFarmerInput): Promise<Farmer> {
  const response = await fetch("/api/petani", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Farmer>;
  return payload.data;
}

export async function updateFarmer(
  id: string,
  input: UpdateFarmerInput,
): Promise<Farmer> {
  const response = await fetch(`/api/petani/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Farmer>;
  return payload.data;
}

export async function deleteFarmer(id: string): Promise<void> {
  const response = await fetch(`/api/petani/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
}
