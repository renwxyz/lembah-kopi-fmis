import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type {
  AddTreatmentInput,
  CreateFertilizationInput,
  CreateIncidentInput,
  CreateSoilConditionInput,
  Fertilization,
  PestDiseaseIncident,
  SoilConditionLog,
  TreatmentRecord,
} from "./types";

interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// ==========================================
// M2.1: SAMPLING PARAMETER TANAH (6-in-1)
// ==========================================

export async function getSoilConditionList(
  landId: string,
): Promise<SoilConditionLog[]> {
  const response = await fetch(
    `/api/lahan/${encodeURIComponent(landId)}/kondisi-tanah?page=1&page_size=100`,
  );
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload =
    (await response.json()) as ApiResponse<PageResponse<SoilConditionLog>>;
  return payload.data.items;
}

export async function createSoilCondition(
  landId: string,
  input: CreateSoilConditionInput,
): Promise<SoilConditionLog> {
  const response = await fetch(
    `/api/lahan/${encodeURIComponent(landId)}/kondisi-tanah`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<SoilConditionLog>;
  return payload.data;
}

// ==========================================
// M2.2: RIWAYAT PEMUPUKAN
// ==========================================

export async function getFertilizationList(
  landId: string,
): Promise<Fertilization[]> {
  const response = await fetch(
    `/api/lahan/${encodeURIComponent(landId)}/pemupukan?page=1&page_size=100`,
  );
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload =
    (await response.json()) as ApiResponse<PageResponse<Fertilization>>;
  return payload.data.items;
}

export async function createFertilization(
  landId: string,
  input: CreateFertilizationInput,
): Promise<Fertilization> {
  const response = await fetch(
    `/api/lahan/${encodeURIComponent(landId)}/pemupukan`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Fertilization>;
  return payload.data;
}

export async function updateFertilization(
  id: string,
  input: CreateFertilizationInput,
): Promise<Fertilization> {
  const response = await fetch(`/api/pemupukan/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<Fertilization>;
  return payload.data;
}

export async function deleteFertilization(id: string): Promise<void> {
  const response = await fetch(`/api/pemupukan/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
}

// ==========================================
// M2.3: CATATAN HAMA & PENYAKIT TANAMAN
// ==========================================

export async function getPestDiseaseList(
  landId: string,
): Promise<PestDiseaseIncident[]> {
  const response = await fetch(
    `/api/lahan/${encodeURIComponent(landId)}/hama-penyakit?page=1&page_size=100`,
  );
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload =
    (await response.json()) as ApiResponse<PageResponse<PestDiseaseIncident>>;
  return payload.data.items;
}

export async function createPestDisease(
  landId: string,
  input: CreateIncidentInput,
): Promise<PestDiseaseIncident> {
  const response = await fetch(
    `/api/lahan/${encodeURIComponent(landId)}/hama-penyakit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<PestDiseaseIncident>;
  return payload.data;
}

export async function deletePestDisease(id: string): Promise<void> {
  const response = await fetch(`/api/hama-penyakit/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await getApiError(response);
  }
}

export async function getTreatments(
  incidentId: string,
): Promise<TreatmentRecord[]> {
  const response = await fetch(
    `/api/hama-penyakit/${encodeURIComponent(incidentId)}/penanganan`,
  );
  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload =
    (await response.json()) as ApiResponse<PageResponse<TreatmentRecord>>;
  return payload.data.items;
}

export async function addTreatment(
  incidentId: string,
  input: AddTreatmentInput,
): Promise<TreatmentRecord> {
  const response = await fetch(
    `/api/hama-penyakit/${encodeURIComponent(incidentId)}/penanganan`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw await getApiError(response);
  }

  const payload = (await response.json()) as ApiResponse<TreatmentRecord>;
  return payload.data;
}

