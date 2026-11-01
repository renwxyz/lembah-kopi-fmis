"use client";

import { useState } from "react";
import { Calendar, Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import {
  useCmsAgenda,
  useCreateCmsAgenda,
  useDeleteCmsAgenda,
  useUpdateCmsAgenda,
} from "../hooks";
import { useSession } from "@/features/auth/hooks/use-session";
import type { Agenda } from "../types";

export function AgendaManager() {
  const { data: agendaList = [], isLoading } = useCmsAgenda();
  const createMutation = useCreateCmsAgenda();
  const updateMutation = useUpdateCmsAgenda();
  const deleteMutation = useDeleteCmsAgenda();
  const { data: session } = useSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);

  const [form, setForm] = useState({
    judul: "",
    tanggal: "",
    keterangan: "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [todayStr] = useState(() => new Date().toISOString().split("T")[0]);

  const openCreateModal = () => {
    setEditingAgenda(null);
    setForm({ judul: "", tanggal: "", keterangan: "" });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (agenda: Agenda) => {
    setEditingAgenda(agenda);
    setForm({
      judul: agenda.judul,
      tanggal: agenda.tanggal.slice(0, 10),
      keterangan: agenda.keterangan || "",
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (editingAgenda) {
      updateMutation.mutate(
        { id: editingAgenda.id_agenda, data: form },
        {
          onSuccess: () => setModalOpen(false),
          onError: (err: unknown) =>
            setErrorMsg(err instanceof Error ? err.message : "Gagal memperbarui agenda"),
        }
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => setModalOpen(false),
        onError: (err: unknown) =>
          setErrorMsg(err instanceof Error ? err.message : "Gagal menambahkan agenda kegiatan"),
      });
    }
  };

  const handleDelete = (id: string, judul: string) => {
    if (!confirm(`Hapus agenda "${judul}"?`)) return;
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
            Agenda & Pengumuman Komunitas
          </h2>
          <p className="text-xs text-[#8A7669]">
            Kegiatan terdekat (maks. 3) akan ditampilkan di publik. Kegiatan yang lewat otomatis terarsip.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2317] transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Agenda</span>
        </button>
      </div>

      {agendaList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D6CEC7] bg-[#FAF8F5] p-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-[#9E8E82] mb-2 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-[#2A1810]">
            Belum ada agenda kegiatan
          </h3>
          <p className="text-xs text-[#8A7669] mt-1 mb-4">
            Catat jadwal panen raya, pelatihan, atau studi banding kelompok tani.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Agenda Pertama</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E8E2DC] bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2DC] text-[#6E5D53] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Tanggal Pelaksanaan</th>
                <th className="py-3 px-4">Judul Agenda</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Status Publik</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE6]">
              {agendaList.map((item) => {
                const isPassed = item.tanggal < todayStr;
                return (
                  <tr
                    key={item.id_agenda}
                    className={`hover:bg-[#FAF8F5]/60 transition ${
                      isPassed ? "opacity-60 bg-[#FAF8F5]/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-[#2A1810] whitespace-nowrap">
                      {item.tanggal}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2A1810]">
                      {item.judul}
                    </td>
                    <td className="py-3 px-4 text-[#6E5D53] max-w-xs truncate">
                      {item.keterangan || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {isPassed ? (
                        <span className="inline-flex rounded-md bg-[#F4F0EC] px-2 py-0.5 text-[10px] font-bold text-[#8A7669]">
                          Terarsip (Lewat)
                        </span>
                      ) : (
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Mendatang (Aktif)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2A1810] hover:text-[#6E5D53]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item.id_agenda, item.judul)
                          }
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL AGENDA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DC]">
              <h3 className="font-heading font-bold text-base text-[#2A1810]">
                {editingAgenda ? "Edit Agenda Kegiatan" : "Tambah Agenda Baru"}
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
              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Judul Agenda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="Contoh: Panen Raya Kopi Arabika Glodogan"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full rounded-xl border border-[#D6CEC7] bg-[#FAF8F5] px-3.5 py-2 text-sm text-[#2A1810] focus:border-[#2A1810] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Tanggal Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm({ ...form, tanggal: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#D6CEC7] bg-[#FAF8F5] px-3.5 py-2 text-sm text-[#2A1810] focus:border-[#2A1810] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Keterangan Singkat (1 Kalimat)
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="Contoh: Terbuka untuk seluruh petani mitra dan sesi pelatihan petik merah."
                  value={form.keterangan}
                  onChange={(e) =>
                    setForm({ ...form, keterangan: e.target.value })
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
                  <span>{editingAgenda ? "Perbarui" : "Simpan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
