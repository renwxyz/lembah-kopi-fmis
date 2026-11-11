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
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-coffee-900">
            Media YouTube & Instagram
          </h2>
          <p className="text-xs text-text-muted">
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
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition min-h-10"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Tautan Media</span>
        </button>
      </div>

      {mediaList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-cream-50 p-12 text-center">
          <Video className="mx-auto h-10 w-10 text-text-muted mb-2 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-coffee-900">
            Belum ada media tersimpan
          </h3>
          <p className="text-xs text-text-muted mt-1 mb-4">
            Tempelkan link video YouTube panen kopi atau postingan Instagram kegiatan petani.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white min-h-10"
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
                  ? "border-border"
                  : "border-dashed border-border opacity-60"
              }`}
            >
              <div className="relative aspect-video w-full bg-coffee-900/5 flex items-center justify-center overflow-hidden">
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
                    className="w-full h-full border-0 bg-surface"
                  />
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-surface">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        item.tipe === "YOUTUBE"
                          ? "bg-danger-tint text-danger-ink"
                          : "bg-danger-tint text-danger-ink"
                      }`}
                    >
                      {item.tipe}
                    </span>
                    <span className="text-[10px] text-text-muted truncate">
                      ID: {item.external_id}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-coffee-900 hover:underline truncate block mt-1"
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
                        ? "bg-success-tint text-success-ink hover:bg-success-tint"
                        : "bg-primary-tint text-text-muted hover:bg-border"
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
                      className="p-1.5 rounded-xl text-danger hover:bg-danger-tint hover:text-danger-ink transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-heading font-bold text-base text-coffee-900">
                Tempel Tautan Media
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-coffee-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-coffee-900 mb-1">
                  Tautan YouTube atau Instagram Post <span className="text-danger">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... atau https://instagram.com/p/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
                />
                <p className="mt-1.5 text-[11px] text-text-muted">
                  Sistem otomatis mengekstrak ID video / embed tanpa perlu menyalin kode iframe.
                </p>
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-danger">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-muted hover:bg-primary-tint"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 min-h-10"
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
