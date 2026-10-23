"use client";

import { useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sprout,
} from "lucide-react";

import { useLahanList } from "@/features/lahan/hooks/use-lahan-list";
import type { Lahan } from "@/features/lahan/types";
import { CreateLahanDialog } from "@/features/lahan/components/create-lahan-dialog";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

const PAGE_SIZE = 10;

function getErrorMessage(error: Error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Sesi tidak tersedia atau telah berakhir. Silakan login kembali.";
    }

    if (error.status === 403) {
      return "Akun Anda tidak memiliki akses untuk melihat data lahan.";
    }

    return error.message;
  }

  return error.message || "Terjadi kesalahan saat mengambil data lahan.";
}

export default function LahanPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const lahanQuery = useLahanList({ search, page, pageSize: PAGE_SIZE });

  const data = lahanQuery.data;
  const items: Lahan[] = data?.items ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / PAGE_SIZE),
  );

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#8A7669]">
            <span>Manajemen Kebun</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#2A1810]">Pemetaan Lahan</span>
          </div>

          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#2A1810]">
            Pemetaan Lahan
          </h1>
          <p className="mt-1 text-sm text-[#6E5D53]">
            Kelola data petak, lokasi geografis, dan luas lahan perkebunan.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Lahan
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E8E2DC] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6E5D53]">Total Lahan</p>
            <div className="rounded-xl bg-[#F4F0EC] p-2 text-[#2A1810]">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl font-bold text-[#2A1810]">
            {lahanQuery.isLoading ? "—" : formatNumber(data?.total)}
          </p>
          <p className="mt-1 text-xs text-[#9E8E82]">
            Petak terdaftar dalam sistem
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8E2DC] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6E5D53]">Luas Halaman Ini</p>
            <div className="rounded-xl bg-[#F4F0EC] p-2 text-[#2A1810]">
              <Sprout className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl font-bold text-[#2A1810]">
            {formatNumber(
              items.reduce((sum, item) => sum + (item.luas_m2 ?? 0), 0) /
                10000,
            )}{" "}
            <span className="text-sm font-medium">ha</span>
          </p>
          <p className="mt-1 text-xs text-[#9E8E82]">
            Akumulasi luas data pada halaman ini
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8E2DC] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6E5D53]">Koordinat Tersedia</p>
            <div className="rounded-xl bg-[#F4F0EC] p-2 text-[#2A1810]">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl font-bold text-[#2A1810]">
            {formatNumber(
              items.filter(
                (item) => item.latitude != null && item.longitude != null,
              ).length,
            )}
          </p>
          <p className="mt-1 text-xs text-[#9E8E82]">
            Dari data pada halaman ini
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E8E2DC] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#E8E2DC] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-[#2A1810]">
              Daftar Petak Lahan
            </h2>
            <p className="mt-1 text-xs text-[#6E5D53]">
              Data berasal dari layanan API lahan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E8E82]" />
              <input
                type="search"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Cari nama petak atau dusun..."
                aria-label="Cari lahan"
                className="h-10 w-full rounded-xl border border-[#E8E2DC] bg-[#FDFCFA] pl-9 pr-3 text-sm text-[#2A1810] outline-none placeholder:text-[#9E8E82] focus:border-[#8A7669] focus:ring-2 focus:ring-[#8A7669]/10"
              />
            </div>

            <button
              type="button"
              onClick={() => void lahanQuery.refetch()}
              disabled={lahanQuery.isFetching}
              aria-label="Muat ulang data lahan"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E2DC] text-[#6E5D53] transition hover:bg-[#F4F0EC] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${lahanQuery.isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {lahanQuery.isPending ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-[#6E5D53]">
            <LoaderCircle className="h-7 w-7 animate-spin text-[#8A7669]" />
            <p className="text-sm">Memuat data lahan...</p>
          </div>
        ) : lahanQuery.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-full bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-[#2A1810]">
              Data lahan gagal dimuat
            </h3>
            <p className="max-w-md text-sm text-[#6E5D53]">
              {getErrorMessage(lahanQuery.error)}
            </p>
            <button
              type="button"
              onClick={() => void lahanQuery.refetch()}
              className="mt-1 rounded-xl bg-[#2A1810] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3D2318]"
            >
              Coba Lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-full bg-[#F4F0EC] p-3 text-[#8A7669]">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-[#2A1810]">
              {search ? "Lahan tidak ditemukan" : "Belum ada data lahan"}
            </h3>
            <p className="max-w-sm text-sm text-[#6E5D53]">
              {search
                ? "Coba gunakan kata kunci lain."
                : "Data lahan akan tampil di sini setelah tersedia dari API."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#F9F8F6] text-xs font-semibold text-[#6E5D53]">
                  <tr>
                    <th className="px-5 py-4">Nama Petak</th>
                    <th className="px-5 py-4">ID Petani</th>
                    <th className="px-5 py-4">Dusun</th>
                    <th className="px-5 py-4 text-right">Elevasi</th>
                    <th className="px-5 py-4 text-right">Luas</th>
                    <th className="px-5 py-4">Koordinat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6]">
                  {items.map((item) => (
                    <tr
                      key={item.id_lahan}
                      className="transition hover:bg-[#FDFCFA]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#2A1810]">
                          {item.nama_petak}
                        </p>
                        <p className="mt-1 text-xs text-[#9E8E82]">
                          ID: {item.id_lahan}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[#6E5D53]">
                        {item.id_petani || "—"}
                      </td>
                      <td className="px-5 py-4 text-[#6E5D53]">
                        {item.dusun || "—"}
                      </td>
                      <td className="px-5 py-4 text-right text-[#6E5D53]">
                        {item.elevasi_mdpl == null
                          ? "—"
                          : `${formatNumber(item.elevasi_mdpl)} mdpl`}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-[#2A1810]">
                        {item.luas_m2 == null
                          ? "—"
                          : `${formatNumber(item.luas_m2)} m²`}
                      </td>
                      <td className="px-5 py-4">
                        {item.latitude != null && item.longitude != null ? (
                          <div className="text-xs text-[#6E5D53]">
                            <p>{item.latitude}</p>
                            <p>{item.longitude}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-[#9E8E82]">
                            Belum tersedia
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#E8E2DC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#6E5D53]">
                Menampilkan{" "}
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, data?.total ?? 0)} dari{" "}
                {formatNumber(data?.total)} lahan
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || lahanQuery.isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="flex h-9 items-center gap-1 rounded-lg border border-[#E8E2DC] px-3 text-xs font-medium text-[#6E5D53] hover:bg-[#F4F0EC] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>
                <span className="px-2 text-xs text-[#6E5D53]">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || lahanQuery.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                  className="flex h-9 items-center gap-1 rounded-lg border border-[#E8E2DC] px-3 text-xs font-medium text-[#6E5D53] hover:bg-[#F4F0EC] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <CreateLahanDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
