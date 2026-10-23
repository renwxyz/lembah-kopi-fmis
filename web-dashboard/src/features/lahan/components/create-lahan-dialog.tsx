"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useCreateLahan } from "@/features/lahan/hooks/use-create-lahan";
import { usePetaniList } from "@/features/petani/hooks/use-petani-list";
import {
  createLahanSchema,
  type CreateLahanSchema as FormValues,
} from "@/features/lahan/validation";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateLahanDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLahanDialog({ isOpen, onClose }: CreateLahanDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const createMutation = useCreateLahan();
  const farmersQuery = usePetaniList();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createLahanSchema),
    defaultValues: {
      id_petani: "",
      nama_petak: "",
      dusun: "Dusun Glodogan",
      elevasi_mdpl: "",
      latitude: "",
      longitude: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await createMutation.mutateAsync({
        id_petani: values.id_petani,
        nama_petak: values.nama_petak.trim(),
        dusun: values.dusun.trim(),
        elevasi_mdpl: values.elevasi_mdpl
          ? parseInt(values.elevasi_mdpl, 10)
          : null,
        latitude: values.latitude ? parseFloat(values.latitude) : null,
        longitude: values.longitude ? parseFloat(values.longitude) : null,
      });

      reset();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Terjadi kesalahan saat menambahkan petak lahan.");
      }
    }
  };

  const farmers = farmersQuery.data?.items ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-[#E8E2DC] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-[#E8E2DC] pb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#2A1810]">
              Tambah Petak Lahan
            </h2>
            <p className="text-xs text-[#6E5D53]">
              Daftarkan lahan perkebunan baru ke sistem Lembah Kopi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6E5D53] hover:bg-[#F4F0EC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {serverError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2A1810]">
              Petani Pemilik <span className="text-red-500">*</span>
            </label>
            <select
              {...register("id_petani")}
              className="mt-1.5 h-10 w-full rounded-xl border border-[#E8E2DC] bg-[#FDFCFA] px-3 text-sm text-[#2A1810] outline-none focus:border-[#8A7669] focus:ring-2 focus:ring-[#8A7669]/10"
            >
              <option value="">-- Pilih Petani Terdaftar --</option>
              {farmers.map((farmer) => (
                <option key={farmer.id_petani} value={farmer.id_petani}>
                  {farmer.nama_lengkap} ({farmer.id_petani})
                </option>
              ))}
            </select>
            {errors.id_petani && (
              <p className="mt-1 text-xs text-red-600">
                {errors.id_petani.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1810]">
              Nama Petak <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("nama_petak")}
              placeholder="Contoh: Petak Cengkeh B1"
              className="mt-1.5 rounded-xl border-[#E8E2DC]"
            />
            {errors.nama_petak && (
              <p className="mt-1 text-xs text-red-600">
                {errors.nama_petak.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1810]">
              Dusun / Lokasi <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("dusun")}
              placeholder="Contoh: Dusun Glodogan"
              className="mt-1.5 rounded-xl border-[#E8E2DC]"
            />
            {errors.dusun && (
              <p className="mt-1 text-xs text-red-600">
                {errors.dusun.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-[#2A1810]">
                Elevasi (mdpl)
              </label>
              <Input
                {...register("elevasi_mdpl")}
                type="number"
                placeholder="1350"
                className="mt-1.5 rounded-xl border-[#E8E2DC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810]">
                Latitude
              </label>
              <Input
                {...register("latitude")}
                type="text"
                placeholder="-7.3305"
                className="mt-1.5 rounded-xl border-[#E8E2DC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1810]">
                Longitude
              </label>
              <Input
                {...register("longitude")}
                type="text"
                placeholder="110.0050"
                className="mt-1.5 rounded-xl border-[#E8E2DC]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2DC]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="rounded-xl border-[#E8E2DC] text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-[#2A1810] text-xs font-semibold text-white hover:bg-[#3D2318]"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Lahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

