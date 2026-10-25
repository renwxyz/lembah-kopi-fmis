"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  User,
  Users,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { usePetaniList } from "../hooks/use-petani-list";
import { CreateEditPetaniDialog } from "./create-edit-petani-dialog";
import { DeletePetaniDialog } from "./delete-petani-dialog";
import type { Farmer } from "../types";

export function PetaniTable() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPetani, setSelectedPetani] = useState<Farmer | null>(null);
  const [deletingPetani, setDeletingPetani] = useState<Farmer | null>(null);

  const { data, isLoading, isError, refetch } = usePetaniList({
    search: search.trim() || undefined,
  });

  const farmers = data?.items ?? [];

  const handleEdit = (farmer: Farmer) => {
    setSelectedPetani(farmer);
    setIsCreateOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setSelectedPetani(null);
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama petani atau nomor HP..."
            className="h-10 rounded-lg bg-white pl-9 shadow-[0_2px_8px_-2px_rgba(42,24,16,0.04)] border-0 focus-visible:ring-2 focus-visible:ring-[#2A1810]/20"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A7669] pointer-events-none" />
        </div>

        <Button
          onClick={() => {
            setSelectedPetani(null);
            setIsCreateOpen(true);
          }}
          className="h-10 gap-2 rounded-lg bg-[#2A1810] px-4 text-xs font-semibold text-white hover:bg-[#3D2317] shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Anggota Petani
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-[#2A1810] border-t-transparent" />
            <p className="mt-3 text-xs text-[#8A7669]">Memuat data anggota petani...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-red-600">Gagal memuat data petani.</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-3 h-8 text-xs rounded-lg"
            >
              Coba Lagi
            </Button>
          </div>
        ) : farmers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#8A7669]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-heading text-sm font-bold text-[#2A1810]">
              {search ? "Petani Tidak Ditemukan" : "Belum Ada Anggota Petani"}
            </h3>
            <p className="mt-1 text-xs text-[#8A7669] max-w-sm mx-auto">
              {search
                ? `Tidak ada anggota petani yang cocok dengan kata kunci "${search}".`
                : "Mulai daftarkan anggota kelompok tani Desa Glodogan untuk menghubungkan kepemilikan petak kebun."}
            </p>
            {!search && (
              <Button
                onClick={() => {
                  setSelectedPetani(null);
                  setIsCreateOpen(true);
                }}
                className="mt-4 h-9 gap-1.5 rounded-lg bg-[#2A1810] text-xs font-semibold text-white shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Petani Pertama
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F4F0EC] bg-[#FCFBF9] text-[11px] font-semibold text-[#8A7669] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Nama Petani</th>
                  <th className="px-6 py-3.5">Kontak / No. HP</th>
                  <th className="px-6 py-3.5">ID Anggota</th>
                  <th className="px-6 py-3.5">Terdaftar Sejak</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0EC]">
                {farmers.map((farmer) => {
                  const rawPhone = farmer.no_hp ? farmer.no_hp.replace(/[^0-9]/g, "") : "";
                  const waPhone = rawPhone.startsWith("0") ? `62${rawPhone.slice(1)}` : rawPhone;

                  return (
                    <tr
                      key={farmer.id_petani}
                      className="hover:bg-[#FAF8F5]/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF8F5] text-[#2A1810] font-heading font-bold text-xs">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-heading font-bold text-sm text-[#2A1810] block">
                              {farmer.nama_lengkap}
                            </span>
                            <span className="text-[11px] text-[#8A7669]">
                              Petani Kopi Glodogan
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {farmer.no_hp ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#2A1810]">
                              {farmer.no_hp}
                            </span>
                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Kirim pesan WhatsApp"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8A7669] italic">Belum ada no. HP</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-[#6E5D53] bg-[#FAF8F5] px-2 py-0.5 rounded-md">
                          {farmer.id_petani}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[#6E5D53]">
                        {farmer.created_at ? formatDate(farmer.created_at) : "—"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(farmer)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6E5D53] hover:bg-[#F4F0EC] hover:text-[#2A1810] transition-colors"
                            title="Ubah data petani"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingPetani(farmer)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                            title="Hapus petani"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog Modals */}
      <CreateEditPetaniDialog
        isOpen={isCreateOpen}
        onClose={handleCloseDialog}
        initialPetani={selectedPetani}
      />

      <DeletePetaniDialog
        isOpen={Boolean(deletingPetani)}
        onClose={() => setDeletingPetani(null)}
        petani={deletingPetani}
      />
    </div>
  );
}
