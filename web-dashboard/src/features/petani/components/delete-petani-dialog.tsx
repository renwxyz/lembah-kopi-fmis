"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-error";
import { useDeletePetani } from "../hooks/use-petani-mutations";
import type { Farmer } from "../types";

interface DeletePetaniDialogProps {
  isOpen: boolean;
  onClose: () => void;
  petani: Farmer | null;
}

export function DeletePetaniDialog({
  isOpen,
  onClose,
  petani,
}: DeletePetaniDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = useDeletePetani();

  if (!isOpen || !petani) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteMutation.mutateAsync(petani.id_petani);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.message.toLowerCase().includes("referensi") || err.message.toLowerCase().includes("conflict")) {
          setError(
            `Tidak dapat menghapus "${petani.nama_lengkap}" karena masih memiliki petak lahan terdaftar. Silakan alihkan atau hapus data lahan terkait terlebih dahulu.`,
          );
        } else {
          setError(err.message || "Gagal menghapus data petani.");
        }
      } else {
        setError("Terjadi kesalahan saat menghapus data petani.");
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-petani-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-[0_25px_60px_-15px_rgba(42,24,16,0.25)]">
        <div className="p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h3
                id="delete-petani-title"
                className="font-heading text-base font-bold text-[#2A1810]"
              >
                Hapus Anggota Petani
              </h3>
              <p className="mt-1 text-xs text-[#6E5D53]">
                Apakah Anda yakin ingin menghapus anggota petani{" "}
                <span className="font-semibold text-[#2A1810]">
                  &ldquo;{petani.nama_lengkap}&rdquo;
                </span>{" "}
                ({petani.no_hp || petani.id_petani})?
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Tutup dialog"
              className="rounded-lg p-1 text-[#8A7669] hover:bg-[#F4F0EC] hover:text-[#2A1810]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={deleteMutation.isPending}
              className="h-9 rounded-lg border-0 bg-stone-100 text-xs font-medium text-stone-700 hover:bg-stone-200 shadow-none px-4"
            >
              Batal
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-9 gap-2 rounded-lg bg-red-600 text-xs font-medium text-white hover:bg-red-700 shadow-sm px-4"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Hapus Petani
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

