"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, AlertCircle, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-error";
import {
  useCreatePetani,
  useUpdatePetani,
} from "../hooks/use-petani-mutations";
import type { Farmer } from "../types";

const petaniSchema = z.object({
  nama_lengkap: z
    .string()
    .min(2, "Nama lengkap petani minimal 2 karakter")
    .max(100, "Nama terlalu panjang"),
  no_hp: z
    .string()
    .min(8, "Nomor HP minimal 8 digit")
    .max(15, "Nomor HP maksimal 15 digit")
    .regex(/^[0-9+-\s]+$/, "Format nomor HP tidak valid"),
});

type FormValues = z.infer<typeof petaniSchema>;

interface CreateEditPetaniDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialPetani?: Farmer | null;
}

function PetaniDialogContent({
  onClose,
  initialPetani,
}: {
  onClose: () => void;
  initialPetani?: Farmer | null;
}) {
  const isEditing = Boolean(initialPetani);
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreatePetani();
  const updateMutation = useUpdatePetani();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(petaniSchema),
    defaultValues: {
      nama_lengkap: initialPetani?.nama_lengkap ?? "",
      no_hp: initialPetani?.no_hp ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const cleanPhone = values.no_hp.replace(/[\s-]/g, "");
    if (cleanPhone.length > 15) {
      setServerError("Nomor HP setelah diformat melebihi 15 digit. Masukkan nomor yang lebih ringkas.");
      return;
    }

    try {
      if (isEditing && initialPetani) {
        await updateMutation.mutateAsync({
          id: initialPetani.id_petani,
          data: {
            nama_lengkap: values.nama_lengkap.trim(),
            no_hp: cleanPhone,
          },
        });
      } else {
        await createMutation.mutateAsync({
          nama_lengkap: values.nama_lengkap.trim(),
          no_hp: cleanPhone,
        });
      }

      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message || "Gagal menyimpan data petani.");
      } else {
        setServerError("Terjadi kesalahan saat memproses data petani.");
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="petani-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-coffee-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-surface shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4.5 bg-surface">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-50 text-coffee-900">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="petani-modal-title"
                className="font-heading text-base font-bold text-coffee-900"
              >
                {isEditing ? "Ubah Data Petani" : "Tambah Anggota Petani"}
              </h2>
              <p className="text-xs text-text-muted">
                {isEditing
                  ? "Perbarui informasi kontak anggota kelompok tani."
                  : "Daftarkan petani baru ke dalam sistem FMIS Glodogan."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-lg p-1.5 text-text-muted hover:bg-primary-tint hover:text-coffee-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {serverError && (
            <div className="flex items-start gap-2.5 rounded-lg bg-danger-tint p-3.5 text-xs text-danger-ink">
              <AlertCircle className="h-4 w-4 shrink-0 text-danger mt-0.5" />
              <div className="flex-1 font-medium">{serverError}</div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-coffee-900 block">
              Nama Lengkap Petani <span className="text-danger">*</span>
            </label>
            <Input
              {...register("nama_lengkap")}
              placeholder="Contoh: Pak Sugeng Hartono"
              className="mt-1.5 h-10 rounded-lg bg-cream-50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
            {errors.nama_lengkap && (
              <p className="mt-1 text-xs text-danger font-medium">
                {errors.nama_lengkap.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-coffee-900 block">
              Nomor Handphone / WhatsApp <span className="text-danger">*</span>
            </label>
            <div className="relative mt-1.5">
              <Input
                {...register("no_hp")}
                type="tel"
                placeholder="Contoh: 081234567890"
                className="h-10 rounded-lg bg-cream-50 border-0 pl-9 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
              <Phone className="absolute left-3 top-3 h-4 w-4 text-text-muted pointer-events-none" />
            </div>
            {errors.no_hp && (
              <p className="mt-1 text-xs text-danger font-medium">
                {errors.no_hp.message}
              </p>
            )}
            <p className="mt-1 text-[11px] text-text-muted">
              Digunakan untuk koordinasi jadwal panen, penyuluhan, dan pemupukan.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 rounded-lg border-0 bg-primary-tint text-xs font-medium text-coffee-900 hover:bg-primary-tint shadow-none px-4"
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 gap-2 rounded-full bg-primary text-xs font-medium text-white hover:bg-primary-hover shadow-sm px-4"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Tambah Petani"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateEditPetaniDialog(props: CreateEditPetaniDialogProps) {
  if (!props.isOpen) return null;
  return (
    <PetaniDialogContent
      key={props.initialPetani?.id_petani ?? "create"}
      {...props}
    />
  );
}

