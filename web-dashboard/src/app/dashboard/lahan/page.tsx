"use client";

import { useState } from "react";
import Link from "next/link";
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
  CheckCircle2,
  Map,
  Eye,
} from "lucide-react";

import { useLahanList } from "@/features/lahan/hooks/use-lahan-list";
import type { Lahan } from "@/features/lahan/types";
import { CreateLahanDialog } from "@/features/lahan/components/create-lahan-dialog";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLahan, setSelectedLahan] = useState<Lahan | null>(null);

  const lahanQuery = useLahanList({ search, page, pageSize: PAGE_SIZE });

  const data = lahanQuery.data;
  const items: Lahan[] = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleOpenCreate() {
    setSelectedLahan(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(lahan: Lahan) {
    setSelectedLahan(lahan);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#8A7669]">
            <span>Manajemen Kebun</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#2A1810]">Pemetaan Lahan</span>
          </div>

          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#2A1810] sm:text-3xl">
            Pemetaan Lahan
          </h1>
          <p className="mt-1 text-sm text-[#6E5D53]">
            Kelola data petak, lokasi geografis, dan plotting polygon batas wilayah perkebunan.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shadow-md">
          <Plus className="h-4 w-4" />
          Tambah Lahan & Plot Batas
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Lahan"
          value={formatNumber(data?.total)}
          icon={MapPin}
          description="Petak terdaftar dalam sistem"
          isLoading={lahanQuery.isLoading}
        />
        <KpiCard
          title="Luas Halaman Ini"
          value={formatNumber(
            items.reduce((sum, item) => sum + (item.luas_m2 ?? 0), 0) / 10000,
          )}
          unit="ha"
          icon={Sprout}
          description="Akumulasi luas data pada halaman ini"
          isLoading={lahanQuery.isLoading}
        />
        <KpiCard
          title="Batas Spasial Terpetakan"
          value={formatNumber(
            items.filter((item) => item.polygon_geom != null).length,
          )}
          unit="petak"
          icon={Map}
          description="Lahan dengan polygon valid"
          isLoading={lahanQuery.isLoading}
        />
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#2A1810]">
              Daftar Petak Lahan
            </h2>
            <p className="mt-0.5 text-xs text-[#6E5D53]">
              Total {formatNumber(data?.total)} petak lahan terdata di sistem
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7669]" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari nama petak atau dusun..."
                className="h-11 w-full rounded-xl bg-[#FAF8F5] pl-10 pr-4 text-xs font-medium text-[#2A1810] placeholder:text-[#8A7669] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A1810]/20"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void lahanQuery.refetch()}
              disabled={lahanQuery.isFetching}
              className="gap-2 text-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  lahanQuery.isFetching ? "animate-spin" : ""
                }`}
              />
              Muat Ulang
            </Button>
          </div>
        </div>

        {lahanQuery.isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-2.5 p-8 text-xs text-[#6E5D53]">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#2A1810]" />
            <span>Memuat data lahan...</span>
          </div>
        ) : lahanQuery.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-8 text-center text-xs">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="font-semibold text-red-800">Gagal memuat data lahan</p>
            <p className="text-[#6E5D53]">{getErrorMessage(lahanQuery.error)}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void lahanQuery.refetch()}
              className="mt-2 text-xs"
            >
              Coba Lagi
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-full bg-[#F4F0EC] p-3 text-[#6E5D53]">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-[#2A1810]">
              {search ? "Lahan tidak ditemukan" : "Belum ada data lahan"}
            </h3>
            <p className="max-w-sm text-xs text-[#6E5D53]">
              {search
                ? "Coba gunakan kata kunci pencarian lain."
                : "Klik 'Tambah Lahan & Plot Batas' untuk mulai mendaftarkan petak kebun."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#F7F4F0] text-xs font-semibold text-[#6E5D53]">
                  <tr>
                    <th className="px-6 py-4">Nama Petak</th>
                    <th className="px-6 py-4">Dusun</th>
                    <th className="px-6 py-4 text-right">Elevasi</th>
                    <th className="px-6 py-4 text-right">Luas</th>
                    <th className="px-6 py-4">Status Batas Spasial</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {items.map((item) => (
                    <tr
                      key={item.id_lahan}
                      className="transition-colors hover:bg-[#FAF8F5]"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/lahan/${encodeURIComponent(item.id_lahan)}`}
                          className="font-bold text-[#2A1810] hover:text-[#5B3A29] hover:underline transition-colors block"
                        >
                          {item.nama_petak}
                        </Link>
                        <p className="mt-0.5 text-xs text-[#8A7669]">
                          ID: {item.id_lahan}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#4A3E37]">
                        {item.dusun || "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-[#4A3E37]">
                        {item.elevasi_mdpl == null
                          ? "—"
                          : `${formatNumber(item.elevasi_mdpl, 0)} mdpl`}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-[#2A1810]">
                        {item.luas_m2 == null
                          ? "—"
                          : `${formatNumber(item.luas_m2, 1)} m²`}
                      </td>
                      <td className="px-6 py-4">
                        {item.polygon_geom ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                            Terpetakan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                            Belum Ada Batas
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/dashboard/lahan/${encodeURIComponent(item.id_lahan)}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-xs border-0 bg-stone-100 hover:bg-stone-200 text-[#2A1810] px-3"
                              title="Buka profil lengkap & inventaris pohon"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Detail
                            </Button>
                          </Link>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 gap-1.5 text-xs font-semibold text-[#2A1810] px-3"
                          >
                            <Map className="h-3.5 w-3.5 text-[#2A1810]" />
                            {item.polygon_geom ? "Batas" : "Plot"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-[#FDFCFA]">
              <p className="text-xs text-[#6E5D53]">
                Menampilkan {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, data?.total ?? 0)} dari{" "}
                {formatNumber(data?.total, 0)} lahan
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || lahanQuery.isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <span className="px-2 text-xs font-semibold text-[#6E5D53]">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || lahanQuery.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                  className="gap-1 text-xs"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <CreateLahanDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedLahan(null);
        }}
        existingLands={items}
        initialLahan={selectedLahan}
      />
    </div>
  );
}
