"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, AlertCircle, MapPin, CheckCircle2, Trash2 } from "lucide-react";
import { useCreateLahan, useUpdateLahan } from "@/features/lahan/hooks/use-create-lahan";
import {
  useSetLahanPolygon,
  useDeleteLahanPolygon,
} from "@/features/lahan/hooks/use-set-lahan-polygon";
import { usePetaniList } from "@/features/petani/hooks/use-petani-list";
import {
  createLahanSchema,
  type CreateLahanSchema as FormValues,
} from "@/features/lahan/validation";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import {
  calculatePolygonAreaM2,
  calculatePolygonCentroid,
  isPolygonSelfIntersecting,
  latLngsToGeoJsonPolygon,
  geoJsonPolygonToLatLngs,
} from "@/lib/gis";
import type { Lahan } from "../types";

// Dynamic import non-SSR untuk kanvas drawing map
const LahanDrawingMap = dynamic(() => import("./lahan-drawing-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-xl border border-border bg-[#F9F8F6] text-xs font-medium text-muted-foreground">
      Memuat kanvas peta GIS...
    </div>
  ),
});

export interface CreateLahanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingLands?: Lahan[];
  initialLahan?: Lahan | null;
}

function LahanDialogContent({
  onClose,
  existingLands = [],
  initialLahan = null,
}: Omit<CreateLahanDialogProps, "isOpen">) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [points, setPoints] = useState<[number, number][]>(() =>
    geoJsonPolygonToLatLngs(initialLahan?.polygon_geom),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateLahan();
  const updateMutation = useUpdateLahan();
  const setPolygonMutation = useSetLahanPolygon();
  const deletePolygonMutation = useDeleteLahanPolygon();
  const farmersQuery = usePetaniList();

  const isEditing = Boolean(initialLahan);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createLahanSchema),
    defaultValues: {
      id_petani: initialLahan?.id_petani ?? "",
      nama_petak: initialLahan?.nama_petak ?? "",
      dusun: initialLahan?.dusun ?? "Dusun Glodogan",
      elevasi_mdpl: initialLahan?.elevasi_mdpl ? String(initialLahan.elevasi_mdpl) : "",
      latitude: initialLahan?.latitude ? String(initialLahan.latitude) : "",
      longitude: initialLahan?.longitude ? String(initialLahan.longitude) : "",
    },
  });

  // Kalkulasi Real-Time
  const areaM2 = useMemo(() => calculatePolygonAreaM2(points), [points]);
  const areaHa = useMemo(() => areaM2 / 10000, [areaM2]);
  const centroid = useMemo(() => calculatePolygonCentroid(points), [points]);
  const hasSelfIntersection = useMemo(() => isPolygonSelfIntersecting(points), [points]);

  // Lahan sekitar untuk referensi (kecualikan lahan yang sedang diedit)
  const otherLands = useMemo(() => {
    if (!initialLahan) return existingLands;
    return existingLands.filter((l) => l.id_lahan !== initialLahan.id_lahan);
  }, [existingLands, initialLahan]);

  const handleDeletePolygonOnly = async () => {
    if (!initialLahan?.id_lahan) return;
    setServerError(null);
    setIsSubmitting(true);
    try {
      await deletePolygonMutation.mutateAsync(initialLahan.id_lahan);
      setPoints([]);
      onClose();
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Gagal menghapus polygon lahan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    // Validasi titik polygon jika ada titik yang digambar
    if (points.length > 0 && points.length < 3) {
      setServerError(
        "Batas lahan membutuhkan minimal 3 titik koordinat untuk membentuk bidang tertutup.",
      );
      return;
    }

    if (hasSelfIntersection) {
      setServerError(
        "Garis batas polygon saling bersilangan. Silakan atur ulang agar batas bidang tidak memotong dirinya sendiri.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let targetLahanId = initialLahan?.id_lahan;
      const elevasiNum = values.elevasi_mdpl ? Number(values.elevasi_mdpl) : null;
      const latNum = centroid ? centroid[0] : (values.latitude ? Number(values.latitude) : null);
      const lonNum = centroid ? centroid[1] : (values.longitude ? Number(values.longitude) : null);

      const lahanPayload = {
        id_petani: values.id_petani,
        nama_petak: values.nama_petak.trim(),
        dusun: values.dusun.trim(),
        elevasi_mdpl: elevasiNum,
        latitude: latNum,
        longitude: lonNum,
      };

      if (!isEditing) {
        // Step A: Buat Lahan Baru (dengan centroid terisi otomatis jika ada polygon)
        const newLahan = await createMutation.mutateAsync(lahanPayload);
        targetLahanId = newLahan.id_lahan;
      } else if (targetLahanId) {
        // Step A (Edit): Perbarui metadata lahan
        await updateMutation.mutateAsync({
          id: targetLahanId,
          input: lahanPayload,
        });
      }

      // Step B: Simpan Polygon jika ada 3 atau lebih titik
      if (targetLahanId && points.length >= 3) {
        const geoJson = latLngsToGeoJsonPolygon(points);
        await setPolygonMutation.mutateAsync({
          id: targetLahanId,
          polygon: geoJson,
        });
      }

      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setServerError(
            "Batas polygon lahan bersinggungan atau tumpang-tindih dengan lahan lain yang sudah terdaftar di sistem. Sesuaikan titik batas agar tidak beririsan.",
          );
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError("Terjadi kesalahan saat menyimpan data lahan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative flex h-[92vh] max-h-[840px] w-[96vw] max-w-[1400px] flex-col lg:flex-row overflow-y-auto lg:overflow-hidden rounded-xl bg-white shadow-[0_25px_60px_-15px_rgba(42,24,16,0.25)]"
      >
        {/* Panel Kiri: Form & Metadata (Sidebar ~420px pada desktop) */}
        <div className="flex flex-col w-full lg:w-[420px] xl:w-[450px] shrink-0 border-r border-[#EFECE6] bg-white lg:h-full">
          {/* Header Modal */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#EFECE6] px-6 py-4.5 bg-white">
            <div>
              <h2 id="modal-title" className="font-heading text-base font-bold text-[#2A1810]">
                {isEditing ? "Ubah Data & Batas Lahan" : "Tambah Lahan Baru"}
              </h2>
              <p className="mt-0.5 text-xs text-[#6E5D53]">
                {isEditing
                  ? "Perbarui informasi dan polygon spasial lahan."
                  : "Lengkapi data lahan dan tentukan batas wilayahnya di peta."}
              </p>
            </div>

            {/* Close Button on Mobile */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup dialog"
              className="lg:hidden rounded-lg p-1.5 text-[#8A7669] hover:bg-[#F4F0EC] hover:text-[#2A1810] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Body (Scrollable pada Desktop) */}
          <div className="flex-1 lg:overflow-y-auto p-6 space-y-4">
            {/* Error Banner */}
            {serverError && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3.5 text-xs text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1 font-medium">{serverError}</div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#2A1810]">
                Petani Pemilik <span className="text-red-500">*</span>
              </label>
              <select
                {...register("id_petani")}
                disabled={farmersQuery.isLoading || isEditing}
                className="mt-1.5 flex h-10 w-full rounded-lg bg-[#FAF8F5] px-3.5 py-2 text-sm font-medium text-[#2A1810] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A1810]/20 disabled:opacity-50"
              >
                <option value="">
                  {farmersQuery.isLoading ? "Memuat data petani..." : "Pilih Petani Pemilik..."}
                </option>
                {farmersQuery.data?.items.map((farmer) => (
                  <option key={farmer.id_petani} value={farmer.id_petani}>
                    {farmer.nama_lengkap} ({farmer.no_hp || farmer.id_petani})
                  </option>
                ))}
              </select>
              {errors.id_petani && (
                <p className="mt-1 text-xs text-red-600">{errors.id_petani.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2A1810]">
                Nama Petak Kebun <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("nama_petak")}
                placeholder="Contoh: Petak Lereng Timur A1"
                className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0 focus-visible:ring-2 focus-visible:ring-[#2A1810]/20"
              />
              {errors.nama_petak && (
                <p className="mt-1 text-xs text-red-600">{errors.nama_petak.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2A1810]">
                Dusun / Lokasi <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("dusun")}
                placeholder="Contoh: Dusun Glodogan"
                className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0 focus-visible:ring-2 focus-visible:ring-[#2A1810]/20"
              />
              {errors.dusun && (
                <p className="mt-1 text-xs text-red-600">{errors.dusun.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2A1810]">
                Elevasi (mdpl)
              </label>
              <Input
                type="number"
                {...register("elevasi_mdpl")}
                placeholder="Contoh: 1250"
                className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0 focus-visible:ring-2 focus-visible:ring-[#2A1810]/20"
              />
              {errors.elevasi_mdpl && (
                <p className="mt-1 text-xs text-red-600">{errors.elevasi_mdpl.message}</p>
              )}
            </div>

            {/* Ringkasan Spasial Card */}
            <div className="rounded-lg bg-[#F7F4F0] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2A1810] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#2A1810]" />
                  Kalkulasi Spasial Real-Time
                </span>
                {points.length >= 3 && !hasSelfIntersection ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                    <CheckCircle2 className="h-3 w-3 text-emerald-700" /> Valid
                  </span>
                ) : (
                  <span className="rounded-md bg-[#EAE4DC] px-2 py-0.5 text-xs font-semibold text-[#6E5D53]">
                    {points.length === 0 ? "Belum Diplot" : `${points.length} Titik`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-0.5 text-xs">
                <div>
                  <span className="text-xs text-[#8A7669] block">Estimasi Luas</span>
                  <span className="font-heading text-base font-bold text-[#2A1810] block">
                    {points.length >= 3 ? `${formatNumber(areaM2, 1)} m²` : "—"}
                  </span>
                  <span className="text-xs font-semibold text-[#6E5D53] block">
                    {points.length >= 3 ? `(~${formatNumber(areaHa, 2)} ha)` : ""}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[#8A7669] block">Titik Centroid</span>
                  <span className="font-mono text-xs font-semibold text-[#2A1810] block truncate">
                    {centroid ? `${centroid[0]}, ${centroid[1]}` : "—"}
                  </span>
                  <span className="text-xs text-[#8A7669] block">Otomatis terisi</span>
                </div>
              </div>

              {hasSelfIntersection && (
                <p className="text-xs text-red-700 font-semibold">
                  ⚠️ Garis polygon saling bersilangan. Sesuaikan titik sudut agar valid.
                </p>
              )}
            </div>
          </div>

          {/* Desktop Footer Actions (Pinned at bottom of Left Sidebar) */}
          <div className="hidden lg:flex shrink-0 items-center justify-between border-t border-[#EFECE6] bg-[#FAFAF8] px-6 py-3.5">
            <div>
              {isEditing && initialLahan?.polygon_geom && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeletePolygonOnly}
                  disabled={isSubmitting}
                  className="h-9 gap-1.5 rounded-lg border-0 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 shadow-none px-3"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Polygon
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-9 rounded-lg border-0 bg-stone-100 text-xs font-medium text-stone-700 hover:bg-stone-200 shadow-none px-4"
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || (points.length > 0 && points.length < 3) || hasSelfIntersection}
                className="h-9 gap-2 rounded-lg bg-[#2A1810] text-xs font-medium text-white hover:bg-[#3D2317] shadow-sm px-4"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEditing ? "Simpan Perubahan" : "Simpan Lahan"}
              </Button>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Canvas Peta Interaktif - Full Bleed (0 border-radius) */}
        <div className="relative flex-1 h-[380px] lg:h-full w-full bg-stone-100 m-0 p-0 overflow-hidden rounded-none [&_.leaflet-container]:!rounded-none">
          <LahanDrawingMap
            points={points}
            onChangePoints={setPoints}
            otherLands={otherLands}
            disabled={isSubmitting}
          />

          {/* Floating Close Button for Desktop */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="hidden lg:flex absolute top-3.5 right-3.5 z-[1001] items-center justify-center h-8 w-8 rounded-lg bg-white/95 text-[#2A1810] shadow-md backdrop-blur border border-black/[0.06] hover:bg-white hover:text-black transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Footer Actions (Sticky at bottom on small screens) */}
        <div className="lg:hidden shrink-0 flex items-center justify-between border-t border-[#EFECE6] bg-[#FAFAF8] px-5 py-3 sticky bottom-0 z-10">
          <div>
            {isEditing && initialLahan?.polygon_geom && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDeletePolygonOnly}
                disabled={isSubmitting}
                className="h-9 gap-1.5 rounded-lg border-0 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 shadow-none px-3"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 rounded-lg border-0 bg-stone-100 text-xs font-medium text-stone-700 hover:bg-stone-200 shadow-none px-3.5"
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || (points.length > 0 && points.length < 3) || hasSelfIntersection}
              className="h-9 gap-1.5 rounded-lg bg-[#2A1810] text-xs font-medium text-white hover:bg-[#3D2317] shadow-sm px-3.5"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Simpan Lahan"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function CreateLahanDialog(props: CreateLahanDialogProps) {
  if (!props.isOpen) return null;
  return <LahanDialogContent key={props.initialLahan?.id_lahan ?? "create"} {...props} />;
}
