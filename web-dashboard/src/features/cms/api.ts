import { getApiError } from "@/lib/api-error";
import type { ApiResponse } from "@/types/api";
import type {
  Agenda,
  CoffeeProduct,
  GalleryPhoto,
  MediaEmbed,
  SiteSettings,
  UploadedImage,
} from "./types";

// Upload image
export async function uploadCmsImage(
  folder: "hero" | "produk" | "galeri",
  file: File,
): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("folder", folder);
  formData.append("file", file);

  const res = await fetch("/api/cms/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<UploadedImage>;
  return payload.data;
}

// Settings
export async function getCmsSettings(): Promise<SiteSettings> {
  const res = await fetch("/api/cms/pengaturan");
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<SiteSettings>;
  return payload.data;
}

export async function updateCmsSettings(data: SiteSettings): Promise<SiteSettings> {
  const res = await fetch("/api/cms/pengaturan", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<SiteSettings>;
  return payload.data;
}

// Products
export async function getCmsProducts(): Promise<CoffeeProduct[]> {
  const res = await fetch("/api/cms/produk");
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<CoffeeProduct[]>;
  return payload.data;
}

export async function createCmsProduct(
  data: Omit<CoffeeProduct, "id_produk" | "created_at" | "updated_at">,
): Promise<CoffeeProduct> {
  const res = await fetch("/api/cms/produk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<CoffeeProduct>;
  return payload.data;
}

export async function updateCmsProduct(
  id: string,
  data: Partial<CoffeeProduct>,
): Promise<CoffeeProduct> {
  const res = await fetch(`/api/cms/produk/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<CoffeeProduct>;
  return payload.data;
}

export async function deleteCmsProduct(id: string): Promise<void> {
  const res = await fetch(`/api/cms/produk/${id}`, { method: "DELETE" });
  if (!res.ok) throw await getApiError(res);
}

// Media
export async function getCmsMedia(): Promise<MediaEmbed[]> {
  const res = await fetch("/api/cms/media");
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<MediaEmbed[]>;
  return payload.data;
}

export async function createCmsMedia(data: {
  url: string;
  tampil?: boolean;
}): Promise<MediaEmbed> {
  const res = await fetch("/api/cms/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<MediaEmbed>;
  return payload.data;
}

export async function updateCmsMedia(
  id: string,
  data: { url: string; tampil?: boolean },
): Promise<MediaEmbed> {
  const res = await fetch(`/api/cms/media/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<MediaEmbed>;
  return payload.data;
}

export async function setCmsMediaVisible(
  id: string,
  tampil: boolean,
): Promise<MediaEmbed> {
  const res = await fetch(`/api/cms/media/${id}/tampil`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tampil }),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<MediaEmbed>;
  return payload.data;
}

export async function deleteCmsMedia(id: string): Promise<void> {
  const res = await fetch(`/api/cms/media/${id}`, { method: "DELETE" });
  if (!res.ok) throw await getApiError(res);
}

// Agenda
export async function getCmsAgenda(): Promise<Agenda[]> {
  const res = await fetch("/api/cms/agenda");
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<Agenda[]>;
  return payload.data;
}

export async function createCmsAgenda(
  data: Omit<Agenda, "id_agenda" | "created_at" | "updated_at">,
): Promise<Agenda> {
  const res = await fetch("/api/cms/agenda", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<Agenda>;
  return payload.data;
}

export async function updateCmsAgenda(
  id: string,
  data: Partial<Agenda>,
): Promise<Agenda> {
  const res = await fetch(`/api/cms/agenda/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<Agenda>;
  return payload.data;
}

export async function deleteCmsAgenda(id: string): Promise<void> {
  const res = await fetch(`/api/cms/agenda/${id}`, { method: "DELETE" });
  if (!res.ok) throw await getApiError(res);
}

// Gallery
export async function getCmsGallery(): Promise<GalleryPhoto[]> {
  const res = await fetch("/api/cms/galeri");
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<GalleryPhoto[]>;
  return payload.data;
}

export async function createCmsGalleryPhoto(data: {
  foto_key: string;
  keterangan: string;
  urutan: number;
}): Promise<GalleryPhoto> {
  const res = await fetch("/api/cms/galeri", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<GalleryPhoto>;
  return payload.data;
}

export async function updateCmsGalleryPhoto(
  id: string,
  data: Partial<GalleryPhoto>,
): Promise<GalleryPhoto> {
  const res = await fetch(`/api/cms/galeri/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await getApiError(res);
  const payload = (await res.json()) as ApiResponse<GalleryPhoto>;
  return payload.data;
}

export async function deleteCmsGalleryPhoto(id: string): Promise<void> {
  const res = await fetch(`/api/cms/galeri/${id}`, { method: "DELETE" });
  if (!res.ok) throw await getApiError(res);
}
