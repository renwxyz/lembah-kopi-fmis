"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Plus, Trash2, Video, X } from "lucide-react";
import {
  useCmsMedia,
  useCreateCmsMedia,
  useDeleteCmsMedia,
  useSetCmsMediaVisible,
} from "../hooks";
import { useSession } from "@/features/auth/hooks/use-session";

export function MediaManager() {
  const { data: mediaList = [], isLoading } = useCmsMedia();
  const createMutation = useCreateCmsMedia();
  const toggleMutation = useSetCmsMediaVisible();
  const deleteMutation = useDeleteCmsMedia();
  const { data: session } = useSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const [modalOpen, setModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    createMutation.mutate(
      { url: urlInput, tampil: true },
      {
        onSuccess: () => {
          setUrlInput("");
          setModalOpen(false);
        },
        onError: (err: unknown) => {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : "Tautan tidak valid. Pastikan tautan berasal dari YouTube atau Instagram post."
          );
        },
      }
    );
  };

  const handleToggle = (id: string, currentTampil: boolean) => {
    toggleMutation.mutate({ id, tampil: !currentTampil });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus tautan media ini secara permanen?")) return;
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
            Media YouTube & Instagram
          </h2>
          <p className="text-xs text-[#8A7669]">
            Cukup salin dan tempel tautan video dokumentasi YouTube atau postingan Instagram.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setUrlInput("");
            setErrorMsg(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2317] transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Tautan Media</span>
        </button>
      </div>

      {mediaList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D6CEC7] bg-[#FAF8F5] p-12 text-center">
          <Video className="mx-auto h-10 w-10 text-[#9E8E82] mb-2 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-[#2A1810]">
            Belum ada media tersimpan
          </h3>
          <p className="text-xs text-[#8A7669] mt-1 mb-4">
            Tempelkan link video YouTube panen kopi atau postingan Instagram kegiatan petani.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Tempel Tautan Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mediaList.map((item) => (
            <div
              key={item.id_media}
              className={`flex flex-col rounded-2xl border bg-white overflow-hidden shadow-xs transition ${
                item.tampil
                  ? "border-[#E8E2DC]"
                  : "border-dashed border-[#D6CEC7] opacity-60"
              }`}
            >
              <div className="relative aspect-video w-full bg-black/5 flex items-center justify-center overflow-hidden">
                {item.tipe === "YOUTUBE" ? (
                  <iframe
                    src={item.embed_url}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <iframe
                    src={item.embed_url}
                    title="Instagram post"
                    className="w-full h-full border-0 bg-white"
                  />
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-white">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        item.tipe === "YOUTUBE"
                          ? "bg-red-100 text-red-700"
                          : "bg-pink-100 text-pink-700"
                      }`}
                    >
                      {item.tipe}
                    </span>
                    <span className="text-[10px] text-[#8A7669] truncate">
                      ID: {item.external_id}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#2A1810] hover:underline truncate block mt-1"
                  >
                    {item.url}
                  </a>
                </div>

                <div className="flex items-center gap-2 pl-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id_media, item.tampil)}
                    disabled={toggleMutation.isPending}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      item.tampil
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-[#F4F0EC] text-[#8A7669] hover:bg-[#E8E2DC]"
                    }`}
                    title={
                      item.tampil
                        ? "Media sedang tampil di publik (klik untuk sembunyikan)"
                        : "Media disembunyikan (klik untuk tayangkan)"
                    }
                  >
                    {item.tampil ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Tayang</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyi</span>
                      </>
                    )}
                  </button>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id_media)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                      title="Hapus media"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TEMPEL LINK MEDIA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DC]">
              <h3 className="font-heading font-bold text-base text-[#2A1810]">
                Tempel Tautan Media
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#8A7669] hover:text-[#2A1810]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Tautan YouTube atau Instagram Post <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... atau https://instagram.com/p/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-[#D6CEC7] bg-[#FAF8F5] px-3.5 py-2 text-sm text-[#2A1810] focus:border-[#2A1810] focus:bg-white focus:outline-hidden"
                />
                <p className="mt-1.5 text-[11px] text-[#8A7669]">
                  Sistem otomatis mengekstrak ID video / embed tanpa perlu menyalin kode iframe.
                </p>
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
                  disabled={createMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-[#2A1810] px-5 py-2 text-xs font-bold text-white hover:bg-[#3D2317] disabled:opacity-50"
                >
                  {createMutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Simpan Media</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
