import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCmsAgenda,
  createCmsGalleryPhoto,
  createCmsMedia,
  createCmsProduct,
  deleteCmsAgenda,
  deleteCmsGalleryPhoto,
  deleteCmsMedia,
  deleteCmsProduct,
  getCmsAgenda,
  getCmsGallery,
  getCmsMedia,
  getCmsProducts,
  getCmsSettings,
  setCmsMediaVisible,
  updateCmsAgenda,
  updateCmsGalleryPhoto,
  updateCmsProduct,
  updateCmsSettings,
  uploadCmsImage,
} from "./api";
import type { Agenda, CoffeeProduct, GalleryPhoto, SiteSettings } from "./types";

export const cmsKeys = {
  all: ["cms"] as const,
  settings: () => [...cmsKeys.all, "settings"] as const,
  products: () => [...cmsKeys.all, "products"] as const,
  media: () => [...cmsKeys.all, "media"] as const,
  agenda: () => [...cmsKeys.all, "agenda"] as const,
  gallery: () => [...cmsKeys.all, "gallery"] as const,
};

// Upload hook
export function useUploadCmsImage() {
  return useMutation({
    mutationFn: ({
      folder,
      file,
    }: {
      folder: "hero" | "produk" | "galeri";
      file: File;
    }) => uploadCmsImage(folder, file),
  });
}

// Settings Hooks
export function useCmsSettings() {
  return useQuery({
    queryKey: cmsKeys.settings(),
    queryFn: getCmsSettings,
  });
}

export function useUpdateCmsSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SiteSettings) => updateCmsSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.settings() });
    },
  });
}

// Product Hooks
export function useCmsProducts() {
  return useQuery({
    queryKey: cmsKeys.products(),
    queryFn: getCmsProducts,
  });
}

export function useCreateCmsProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CoffeeProduct, "id_produk" | "created_at" | "updated_at">) =>
      createCmsProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.products() });
    },
  });
}

export function useUpdateCmsProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CoffeeProduct> }) =>
      updateCmsProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.products() });
    },
  });
}

export function useDeleteCmsProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCmsProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.products() });
    },
  });
}

// Media Hooks
export function useCmsMedia() {
  return useQuery({
    queryKey: cmsKeys.media(),
    queryFn: getCmsMedia,
  });
}

export function useCreateCmsMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { url: string; tampil?: boolean }) => createCmsMedia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.media() });
    },
  });
}

export function useSetCmsMediaVisible() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tampil }: { id: string; tampil: boolean }) =>
      setCmsMediaVisible(id, tampil),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.media() });
    },
  });
}

export function useDeleteCmsMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCmsMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.media() });
    },
  });
}

// Agenda Hooks
export function useCmsAgenda() {
  return useQuery({
    queryKey: cmsKeys.agenda(),
    queryFn: getCmsAgenda,
  });
}

export function useCreateCmsAgenda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Agenda, "id_agenda" | "created_at" | "updated_at">) =>
      createCmsAgenda(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.agenda() });
    },
  });
}

export function useUpdateCmsAgenda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agenda> }) =>
      updateCmsAgenda(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.agenda() });
    },
  });
}

export function useDeleteCmsAgenda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCmsAgenda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.agenda() });
    },
  });
}

// Gallery Hooks
export function useCmsGallery() {
  return useQuery({
    queryKey: cmsKeys.gallery(),
    queryFn: getCmsGallery,
  });
}

export function useCreateCmsGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { foto_key: string; keterangan: string; urutan: number }) =>
      createCmsGalleryPhoto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.gallery() });
    },
  });
}

export function useUpdateCmsGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GalleryPhoto> }) =>
      updateCmsGalleryPhoto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.gallery() });
    },
  });
}

export function useDeleteCmsGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCmsGalleryPhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.gallery() });
    },
  });
}
