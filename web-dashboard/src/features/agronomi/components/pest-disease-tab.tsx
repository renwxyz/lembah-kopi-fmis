"use client";

import { useState } from "react";
import {
  Bug,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api-error";
import {
  useAddTreatment,
  useCreatePestDisease,
  useDeletePestDisease,
  usePestDiseaseList,
} from "../hooks/use-agronomi";
import type {
  AddTreatmentInput,
  CreateIncidentInput,
  PestDiseaseIncident,
  StatusPenanganan,
  TingkatSerangan,
} from "../types";

interface PestDiseaseTabProps {
  landId: string;
}

const SEVERITY_CONFIG: Record<
  TingkatSerangan,
  { label: string; badgeClass: string }
> = {
  RINGAN: {
    label: "Ringan",
    badgeClass: "bg-emerald-50 text-emerald-800",
  },
  SEDANG: {
    label: "Sedang",
    badgeClass: "bg-amber-50 text-amber-900",
  },
  BERAT: {
    label: "Berat / Kritis",
    badgeClass: "bg-red-50 text-red-800",
  },
};

const STATUS_CONFIG: Record<
  StatusPenanganan,
  { label: string; badgeClass: string }
> = {
  TERDETEKSI: {
    label: "Baru Terdeteksi",
    badgeClass: "bg-red-100/80 text-red-900 font-semibold",
  },
  DALAM_PENANGANAN: {
    label: "Dalam Penanganan",
    badgeClass: "bg-blue-50 text-blue-800 font-semibold",
  },
  TERKENDALI: {
    label: "Terkendali / Sembuh",
    badgeClass: "bg-emerald-100 text-emerald-900 font-semibold",
  },
};

export function PestDiseaseTab({ landId }: PestDiseaseTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [treatingItem, setTreatingItem] = useState<PestDiseaseIncident | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: list = [], isLoading, isError, refetch } = usePestDiseaseList(landId);

  const activeIncidents = list.filter((i) => i.status_penanganan !== "TERKENDALI");
  const severeCount = list.filter((i) => i.tingkat_serangan === "BERAT").length;
  const controlledCount = list.filter((i) => i.status_penanganan === "TERKENDALI").length;

  const deleteMutation = useDeletePestDisease(landId);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeletingId(null);
    } catch {
      // Handled
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#2A1810]">
            Catatan Hama & Penyakit Tanaman Kopi (M2.3)
          </h2>
          <p className="mt-0.5 text-xs text-[#6E5D53]">
            Pelaporan insiden (PBKo, Karat Daun), tingkat serangan, dan pemantauan tindakan pengendalian.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 gap-1.5 rounded-lg bg-[#2A1810] px-4 text-xs font-semibold text-white hover:bg-[#3D2317] shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Lapor Insiden Hama/Penyakit
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
              Insiden Aktif
            </span>
            <span className="mt-1 font-heading text-2xl font-bold tracking-tight text-[#2A1810] block">
              {activeIncidents.length}
            </span>
            <span className="text-xs text-[#6E5D53]">
              {activeIncidents.length > 0 ? "Memerlukan penanganan tim kebun" : "Kebun dalam kondisi aman"}
            </span>
          </div>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              activeIncidents.length > 0 ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
              Serangan Berat
            </span>
            <span className="mt-1 font-heading text-2xl font-bold tracking-tight text-red-600 block">
              {severeCount}
            </span>
            <span className="text-xs text-[#6E5D53]">Kategori bahaya prioritas</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-800">
            <Bug className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-[#8A7669] tracking-wider block">
              Terkendali / Sembuh
            </span>
            <span className="mt-1 font-heading text-2xl font-bold tracking-tight text-emerald-700 block">
              {controlledCount}
            </span>
            <span className="text-xs text-[#6E5D53]">Berhasil dipulihkan</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-[#2A1810] border-t-transparent" />
            <p className="mt-2 text-xs text-[#8A7669]">Memuat catatan hama & penyakit...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-xs font-semibold text-red-600">Gagal memuat catatan hama/penyakit.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2 h-8 text-xs">
              Coba Lagi
            </Button>
          </div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-heading text-sm font-bold text-[#2A1810]">
              Tidak Ada Insiden Hama / Penyakit
            </h3>
            <p className="mt-1 text-xs text-[#8A7669] max-w-sm mx-auto">
              Petak kebun ini saat ini bersih dari serangan hama atau penyakit kopi aktif.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 h-9 gap-1.5 rounded-lg bg-[#2A1810] text-xs font-semibold text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Lapor Insiden Baru
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#F4F0EC]">
            {list.map((incident) => {
              const sev = SEVERITY_CONFIG[incident.tingkat_serangan];
              const st = STATUS_CONFIG[incident.status_penanganan];

              return (
                <div key={incident.id_insiden} className="p-5 hover:bg-[#FAF8F5]/80 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#8A7669] bg-[#FAF8F5] px-2 py-0.5 rounded-md">
                          {incident.id_insiden}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${sev.badgeClass}`}>
                          {sev.label}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-md ${st.badgeClass}`}>
                          {st.label}
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-base text-[#2A1810]">
                        {incident.jenis_hama_penyakit}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-[#8A7669]">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Ditemukan: {formatDate(incident.tanggal_ditemukan)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        size="sm"
                        onClick={() => setTreatingItem(incident)}
                        className="h-8 gap-1.5 rounded-lg bg-[#2A1810] text-xs font-medium text-white shadow-none"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Catat Penanganan
                      </Button>

                      <button
                        type="button"
                        onClick={() => setDeletingId(incident.id_insiden)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Hapus insiden"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Latest Treatment Note */}
                  {incident.penanganan_terakhir && (
                    <div className="mt-3 rounded-lg bg-[#F4F0EC]/70 p-3 text-xs text-[#4A3E37]">
                      <span className="font-semibold text-[#2A1810] block mb-0.5">
                        Tindakan Terakhir ({formatDate(incident.penanganan_terakhir.tanggal_penanganan)}):
                      </span>
                      <p>{incident.penanganan_terakhir.tindakan_penanganan || "Tidak ada catatan detail."}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Lapor Insiden */}
      {isCreateOpen && (
        <CreateIncidentDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          landId={landId}
        />
      )}

      {/* Modal Tambah Penanganan */}
      {treatingItem && (
        <AddTreatmentDialog
          isOpen={Boolean(treatingItem)}
          onClose={() => setTreatingItem(null)}
          landId={landId}
          incident={treatingItem}
        />
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
            <h4 className="font-heading text-sm font-bold text-[#2A1810]">
              Hapus Catatan Insiden?
            </h4>
            <p className="mt-1 text-xs text-[#6E5D53]">
              Catatan insiden hama/penyakit ini beserta seluruh histori penanganannya akan dihapus.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingId(null)}
                className="h-8 text-xs border-0 bg-stone-100"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={deleteMutation.isPending}
                className="h-8 text-xs bg-red-600 text-white hover:bg-red-700"
              >
                {deleteMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dialog: Lapor Insiden
function CreateIncidentDialog({
  isOpen,
  onClose,
  landId,
}: {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
}) {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [jenisHama, setJenisHama] = useState("Penggerek Buah Kopi (PBKo)");
  const [severity, setSeverity] = useState<TingkatSerangan>("RINGAN");
  const [tindakan, setTindakan] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreatePestDisease(landId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: CreateIncidentInput = {
      tanggal_ditemukan: tanggal,
      jenis_hama_penyakit: jenisHama.trim(),
      tingkat_serangan: severity,
      tindakan_penanganan: tindakan.trim() || undefined,
      status_penanganan: tindakan.trim() ? "DALAM_PENANGANAN" : "TERDETEKSI",
    };

    try {
      await createMutation.mutateAsync(payload);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Gagal melaporkan insiden hama/penyakit.");
      } else {
        setError("Terjadi kesalahan saat menyimpan data.");
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-[0_25px_60px_-15px_rgba(42,24,16,0.25)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#EFECE6] px-6 py-4 bg-white">
          <h3 className="font-heading text-base font-bold text-[#2A1810]">
            Lapor Insiden Hama / Penyakit Tanaman
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-[#8A7669] hover:bg-[#F4F0EC]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Tanggal Ditemukan Gejala <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Jenis Hama atau Penyakit <span className="text-red-500">*</span>
            </label>
            <Input
              value={jenisHama}
              onChange={(e) => setJenisHama(e.target.value)}
              placeholder="Contoh: Penggerek Buah Kopi (PBKo), Karat Daun, Jamur Upas"
              className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Tingkat Serangan <span className="text-red-500">*</span>
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as TingkatSerangan)}
              className="mt-1.5 flex h-10 w-full rounded-lg bg-[#FAF8F5] px-3.5 py-2 text-xs font-medium text-[#2A1810] border-0"
            >
              <option value="RINGAN">Ringan (Gejala awal &lt; 10% tanaman)</option>
              <option value="SEDANG">Sedang (Tersebar di beberapa titik 10–30%)</option>
              <option value="BERAT">Berat / Kritis (Meluas &gt; 30%, risiko gagal panen)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Tindakan Penanganan Awal (Opsional)
            </label>
            <textarea
              value={tindakan}
              onChange={(e) => setTindakan(e.target.value)}
              rows={3}
              placeholder="Contoh: Penyemprotan pestisida nabati neem oil dan pemangkasan ranting terdampak."
              className="mt-1.5 w-full rounded-lg bg-[#FAF8F5] p-3 text-xs text-[#2A1810] border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A1810]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFECE6]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="h-9 rounded-lg border-0 bg-stone-100 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 gap-2 rounded-lg bg-[#2A1810] text-xs font-medium text-white shadow-sm"
            >
              {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Laporkan Insiden
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Dialog: Add Treatment
function AddTreatmentDialog({
  isOpen,
  onClose,
  landId,
  incident,
}: {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
  incident: PestDiseaseIncident;
}) {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [tindakan, setTindakan] = useState("");
  const [status, setStatus] = useState<StatusPenanganan>(
    incident.status_penanganan === "TERDETEKSI" ? "DALAM_PENANGANAN" : incident.status_penanganan,
  );
  const [error, setError] = useState<string | null>(null);

  const addTreatmentMutation = useAddTreatment(landId, incident.id_insiden);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tindakan.trim()) {
      setError("Deskripsi tindakan penanganan wajib diisi.");
      return;
    }

    const payload: AddTreatmentInput = {
      tanggal_penanganan: new Date(tanggal).toISOString(),
      tindakan_penanganan: tindakan.trim(),
      status_penanganan: status,
    };

    try {
      await addTreatmentMutation.mutateAsync(payload);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Gagal mencatat penanganan.");
      } else {
        setError("Terjadi kesalahan saat menyimpan data.");
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-[0_25px_60px_-15px_rgba(42,24,16,0.25)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#EFECE6] px-6 py-4 bg-white">
          <div>
            <h3 className="font-heading text-base font-bold text-[#2A1810]">
              Catat Tindakan Penanganan
            </h3>
            <p className="text-xs text-[#6E5D53]">
              Insiden: <span className="font-semibold text-[#2A1810]">{incident.jenis_hama_penyakit}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-[#8A7669] hover:bg-[#F4F0EC]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Tanggal Tindakan Penanganan <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="mt-1.5 h-10 rounded-lg bg-[#FAF8F5] border-0"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Tindakan Penanganan yang Dilakukan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={tindakan}
              onChange={(e) => setTindakan(e.target.value)}
              rows={3}
              placeholder="Contoh: Pemangkasan sanitasi ranting, aplikasi Beauveria bassiana pada buah terserang."
              className="mt-1.5 w-full rounded-lg bg-[#FAF8F5] p-3 text-xs text-[#2A1810] border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A1810]/20"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2A1810] block">
              Pembaruan Status Penanganan <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusPenanganan)}
              className="mt-1.5 flex h-10 w-full rounded-lg bg-[#FAF8F5] px-3.5 py-2 text-xs font-medium text-[#2A1810] border-0"
            >
              <option value="DALAM_PENANGANAN">Dalam Penanganan (Sedang Berjalan)</option>
              <option value="TERKENDALI">Terkendali / Sembuh (Serangan Berhenti)</option>
              <option value="TERDETEKSI">Terdeteksi Kembali (Masih Aktif)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFECE6]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={addTreatmentMutation.isPending}
              className="h-9 rounded-lg border-0 bg-stone-100 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={addTreatmentMutation.isPending}
              className="h-9 gap-2 rounded-lg bg-[#2A1810] text-xs font-medium text-white shadow-sm"
            >
              {addTreatmentMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Simpan Penanganan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
