import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type {
  CreateInventoryInput,
  CreateLahanInput,
  CropInventory,
  GeoJsonPolygon,
  GetLahanParams,
  Lahan,
  LahanPage,
  TreePopulationItem,
  TreePopulationSummary,
} from "./types";

export async function getLahan(params: GetLahanParams = {}): Promise<LahanPage> {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 20),
  });

  if (params.search) searchParams.set("search", params.search);
  if (params.farmerId) searchParams.set("farmer_id", params.farmerId);

  const response = await fetch(`/api/lahan?${searchParams}`);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<LahanPage>;
  return payload.data;
}

export async function getLahanDetail(id: string): Promise<Lahan> {
  const response = await fetch(`/api/lahan/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Lahan>;
  return payload.data;
}

export async function createLahan(input: CreateLahanInput): Promise<Lahan> {
  const response = await fetch("/api/lahan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Lahan>;
  return payload.data;
}

export async function updateLahan(
  id: string,
  input: Partial<CreateLahanInput>,
): Promise<Lahan> {
  const response = await fetch(`/api/lahan/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Lahan>;
  return payload.data;
}

export async function deleteLahan(id: string): Promise<void> {
  const response = await fetch(`/api/lahan/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
}

export async function setLahanPolygon(
  id: string,
  polygon: GeoJsonPolygon,
): Promise<Lahan> {
  const response = await fetch(`/api/lahan/${encodeURIComponent(id)}/polygon`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ polygon_geom: polygon }),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Lahan>;
  return payload.data;
}

export async function deleteLahanPolygon(id: string): Promise<Lahan> {
  const response = await fetch(`/api/lahan/${encodeURIComponent(id)}/polygon`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Lahan>;
  return payload.data;
}

// ==========================================
// M1.3: INVENTARISASI & POPULASI POHON KOPI
// ==========================================

export async function getLahanInventory(
  landId: string,
): Promise<CropInventory[]> {
  const response = await fetch(`/api/lahan/${encodeURIComponent(landId)}/inventaris`);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<CropInventory[]>;
  return payload.data;
}

export async function getLahanPopulation(
  landId: string,
): Promise<TreePopulationSummary> {
  const response = await fetch(`/api/lahan/${encodeURIComponent(landId)}/populasi-pohon`);
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<TreePopulationSummary>;
  return payload.data;
}

export async function createLahanInventory(
  landId: string,
  input: CreateInventoryInput,
): Promise<CropInventory> {
  const response = await fetch(`/api/lahan/${encodeURIComponent(landId)}/inventaris`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      varietas: input.varietas,
      kelompok_usia: input.kelompok_usia,
    }),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<CropInventory>;
  const created = payload.data;

  // Jika jumlah pohon diberikan (>0), panggil populasi pohon
  if (input.jumlah_pohon && input.jumlah_pohon > 0) {
    await setInventoryPopulation(created.id_inventaris, input.jumlah_pohon);
  }

  return created;
}

export async function setInventoryPopulation(
  inventoryId: string,
  treeCount: number,
): Promise<TreePopulationItem> {
  const response = await fetch(
    `/api/inventaris/${encodeURIComponent(inventoryId)}/populasi-pohon`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jumlah_pohon: treeCount }),
    },
  );

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<TreePopulationItem>;
  return payload.data;
}

export async function deleteInventory(inventoryId: string): Promise<void> {
  const response = await fetch(`/api/inventaris/${encodeURIComponent(inventoryId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
}
