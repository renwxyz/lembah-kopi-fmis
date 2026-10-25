"use client";

import { useState } from "react";
import { Coffee, Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import {
  useCmsProducts,
  useCreateCmsProduct,
  useDeleteCmsProduct,
  useUpdateCmsProduct,
} from "../hooks";
import { ImageUploadField } from "./image-upload-field";
import { useSession } from "@/features/auth/hooks/use-session";
import type { CoffeeProduct } from "../types";

export function ProductsManager() {
  const { data: products = [], isLoading } = useCmsProducts();
  const createMutation = useCreateCmsProduct();
  const updateMutation = useUpdateCmsProduct();
  const deleteMutation = useDeleteCmsProduct();
  const { data: session } = useSession();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CoffeeProduct | null>(
    null
  );

  const [form, setForm] = useState<{
    nama: string;
    varietas: CoffeeProduct["varietas"];
    proses: CoffeeProduct["proses"];
    foto_key: string;
    foto_url?: string;
    status_ketersediaan: CoffeeProduct["status_ketersediaan"];
  }>({
    nama: "",
    varietas: "ARABIKA",
    proses: "NATURAL",
    foto_key: "",
    status_ketersediaan: "TERSEDIA",
  });

  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm({
      nama: "",
      varietas: "ARABIKA",
      proses: "NATURAL",
      foto_key: "",
      status_ketersediaan: "TERSEDIA",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (product: CoffeeProduct) => {
    setEditingProduct(product);
    setForm({
      nama: product.nama,
      varietas: product.varietas,
      proses: product.proses,
      foto_key: product.foto_key || "",
      foto_url: product.foto_url,
      status_ketersediaan: product.status_ketersediaan,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id_produk, data: form },
        {
          onSuccess: () => setModalOpen(false),
          onError: (err: unknown) =>
            setFormError(err instanceof Error ? err.message : "Gagal memperbarui data kopi"),
        }
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => setModalOpen(false),
        onError: (err: unknown) =>
          setFormError(err instanceof Error ? err.message : "Gagal menambahkan varietas kopi"),
      });
    }
  };

  const handleDelete = (id: string, nama: string) => {
    if (!confirm(`Hapus varietas kopi "${nama}" secara permanen?`)) return;
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
            Katalog Varietas Kopi
          </h2>
          <p className="text-xs text-[#8A7669]">
            Produk etalase showcase publik dengan tautan direct pesan ke WhatsApp.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2317] transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kopi</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D6CEC7] bg-[#FAF8F5] p-12 text-center">
          <Coffee className="mx-auto h-10 w-10 text-[#9E8E82] mb-2 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-[#2A1810]">
            Belum ada varietas kopi terdaftar
          </h3>
          <p className="text-xs text-[#8A7669] mt-1 mb-4">
            Tambahkan produk unggulan kelompok tani untuk ditampilkan pada grid katalog publik.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kopi Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((item) => (
            <div
              key={item.id_produk}
              className="flex flex-col rounded-2xl border border-[#E8E2DC] bg-white overflow-hidden shadow-xs hover:shadow-md transition"
            >
              <div className="relative h-44 w-full bg-[#FAF8F5]">
                {item.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.foto_url}
                    alt={item.nama}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#9E8E82]">
                    <Coffee className="h-10 w-10 stroke-[1.5]" />
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      item.status_ketersediaan === "TERSEDIA"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status_ketersediaan === "TERBATAS"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status_ketersediaan}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#2A1810]">
                    {item.nama}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#8A7669]">
                    <span className="font-semibold text-[#6E5D53]">
                      {item.varietas}
                    </span>
                    <span>•</span>
                    <span>{item.proses.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#F0EBE6] pt-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2A1810] hover:text-[#6E5D53]"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id_produk, item.nama)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TAMBAH / EDIT KOPI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DC]">
              <h3 className="font-heading font-bold text-base text-[#2A1810]">
                {editingProduct ? "Edit Varietas Kopi" : "Tambah Varietas Kopi"}
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
                  Nama Produk Kopi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="Contoh: Glodogan Arabika Honey Premium"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full rounded-xl border border-[#D6CEC7] bg-[#FAF8F5] px-3.5 py-2 text-sm text-[#2A1810] focus:border-[#2A1810] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Jenis Varietas
                  </label>
                  <select
                    value={form.varietas}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        varietas: e.target.value as CoffeeProduct["varietas"],
                      })
                    }
                    className="w-full rounded-xl border border-[#D6CEC7] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#2A1810] focus:outline-hidden"
                  >
                    <option value="ARABIKA">Arabika</option>
                    <option value="ROBUSTA">Robusta</option>
                    <option value="LIBERIKA">Liberika</option>
                    <option value="EXCELSA">Excelsa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                    Proses Pengolahan
                  </label>
                  <select
                    value={form.proses}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        proses: e.target.value as CoffeeProduct["proses"],
                      })
                    }
                    className="w-full rounded-xl border border-[#D6CEC7] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#2A1810] focus:outline-hidden"
                  >
                    <option value="NATURAL">Natural</option>
                    <option value="HONEY">Honey</option>
                    <option value="FULL_WASHED">Full Washed</option>
                    <option value="SEMI_WASHED">Semi Washed</option>
                    <option value="WET_HULLED">Wet Hulled (Giling Basah)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1810] mb-1">
                  Status Ketersediaan
                </label>
                <div className="flex gap-2">
                  {(["TERSEDIA", "TERBATAS", "HABIS"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, status_ketersediaan: status })
                        }
                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition border ${
                          form.status_ketersediaan === status
                            ? status === "TERSEDIA"
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : status === "TERBATAS"
                              ? "bg-amber-600 border-amber-600 text-white"
                              : "bg-red-600 border-red-600 text-white"
                            : "bg-[#FAF8F5] border-[#E8E2DC] text-[#6E5D53]"
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>

              <ImageUploadField
                label="Foto Kemasan / Biji Kopi"
                folder="produk"
                currentKey={form.foto_key}
                currentUrl={form.foto_url}
                onSuccess={(key, url) =>
                  setForm({ ...form, foto_key: key, foto_url: url })
                }
                onRemove={() =>
                  setForm({ ...form, foto_key: "", foto_url: "" })
                }
              />

              {formError && (
                <p className="text-xs font-medium text-red-600">{formError}</p>
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
                  <span>{editingProduct ? "Perbarui" : "Simpan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
