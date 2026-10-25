"use client";

import { useState } from "react";
import { Edit2, Image as ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import {
  useCmsGallery,
  useCreateCmsGalleryPhoto,
  useDeleteCmsGalleryPhoto,
  useUpdateCmsGalleryPhoto,
} from "../hooks";
import { ImageUploadField } from "./image-upload-field";
import { useSession } from "@/features/auth/hooks/use-session";
import type { GalleryPhoto } from "../types";

export function GalleryManager() {
  const { data: gallery = [], isLoading } = useCmsGallery();
  const createMutation = useCreateCmsGalleryPhoto();
  const updateMutation = useUpdateCmsGalleryPhoto();
  const deleteMutation = useDeleteCmsGalleryPhoto();
  const { data: session } = useSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);

  const [form, setForm] = useState({
    foto_key: "",
    foto_url: "",
    keterangan: "",
    urutan: 0,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingPhoto(null);
    setForm({
      foto_key: "",
      foto_url: "",
      keterangan: "",
      urutan: gallery.length,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setForm({
      foto_key: photo.foto_key,
      foto_url: photo.foto_url || "",
      keterangan: photo.keterangan || "",
      urutan: photo.urutan,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.foto_key) {
      setErrorMsg("Foto wajib diunggah terlebih dahulu");
      return;
    }

    if (editingPhoto) {
      updateMutation.mutate(
        { id: editingPhoto.id_foto, data: form },
        {
          onSuccess: () => setModalOpen(false),
          onError: (err: unknown) =>
            setErrorMsg(err instanceof Error ? err.message : "Gagal memperbarui foto galeri"),
        }
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => setModalOpen(false),
        onError: (err: unknown) =>
          setErrorMsg(err instanceof Error ? err.message : "Gagal menambahkan foto galeri"),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus foto ini dari galeri publik beserta filenya?")) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#6E5D53]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#2A1810]">
            Dokumentasi & Galeri Foto
          </h2>
          <p className="text-xs text-[#8A7669]">
            Maksimal 6-8 foto terbaik akan disajikan di grid galeri publik.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2317] transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Foto</span>
        </button>
      </div>

      {gallery.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D6CEC7] bg-[#FAF8F5] p-12 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-[#9E8E82] mb-2 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-[#2A1810]">
            Belum ada foto galeri
          </h3>
          <p className="text-xs text-[#8A7669] mt-1 mb-4">
            Unggah foto panen, stasiun penjemuran, atau aktivitas petani kopi Glodogan.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Unggah Foto Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map((photo) => (
            <div
              key={photo.id_foto}
              className="group relative flex flex-col rounded-2xl border border-[#E8E2DC] bg-white overflow-hidden shadow-xs hover:shadow-md transition"
            >
              <div className="aspect-square w-full bg-[#FAF8F5] relative overflow-hidden">
                {photo.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.foto_url}
                    alt={photo.keterangan || "Galeri"}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#9E8E82]">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/60 text-white rounded-md px-1.5 py-0.5 text-[10px] font-mono">
                  #{photo.urutan}
                </div>
              </div>

              <div className="p-3 space-y-2 bg-white">
                <p className="text-xs text-[#2A1810] truncate font-medium">
                  {photo.keterangan || "(Tanpa keterangan)"}
                </p>

                <div className="flex items-center justify-between border-t border-[#F0EBE6] pt-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(photo)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2A1810] hover:text-[#6E5D53]"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(photo.id_foto)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FOTO GALERI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DC]">
              <h3 className="font-heading font-bold text-base text-[#2A1810]">
                {editingPhoto ? "Edit Foto Galeri" : "Tambah Foto Galeri"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#8A7669] hover:text-[#2A1810]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <ImageUploadField
                label="Pilih Foto Aktivitas"
                folder="galeri"
                required
                currentKey={form.foto_key}
                currentUrl={form.foto_url}
                onSuccess={(key, url) =>
                  setForm({ ...form, foto_key: key, foto_url: url })
                }
                onRemove={() =>
                  setForm({ ...form, foto_key: "", foto_url: "" })
                }
              />

              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Keterangan Foto (Caption)
                </label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Contoh: Proses sortasi petik merah buah ceri kopi"
                  value={form.keterangan}
                  onChange={(e) =>
                    setForm({ ...form, keterangan: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#D6CEC7] bg-[#FAF8F5] px-3.5 py-2 text-sm text-[#2A1810] focus:border-[#2A1810] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Urutan Penayangan (Angka terkecil tampil lebih dulu)
                </label>
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={form.urutan}
                  onChange={(e) =>
                    setForm({ ...form, urutan: parseInt(e.target.value) || 0 })
                  }
                  className="w-full rounded-xl border border-[#D6CEC7] bg-[#FAF8F5] px-3.5 py-2 text-sm text-[#2A1810] focus:border-[#2A1810] focus:bg-white focus:outline-hidden"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-red-600">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E2DC]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#D6CEC7] px-4 py-2 text-xs font-semibold text-[#6E5D53] hover:bg-[#F4F0EC]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-[#2A1810] px-5 py-2 text-xs font-bold text-white hover:bg-[#3D2317] disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>{editingPhoto ? "Perbarui" : "Simpan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
