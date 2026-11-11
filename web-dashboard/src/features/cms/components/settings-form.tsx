"use client";

import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { useCmsSettings, useUpdateCmsSettings } from "../hooks";
import { ImageUploadField } from "./image-upload-field";
import type { SiteSettings } from "../types";

export function SettingsForm() {
  const { data: settings, isLoading } = useCmsSettings();
  const updateMutation = useUpdateCmsSettings();

  const [formData, setFormData] = useState<SiteSettings>(() => {
    if (settings) {
      return {
        ...settings,
        about_nilai:
          settings.about_nilai && settings.about_nilai.length === 3
            ? settings.about_nilai
            : [
                { judul: "", deskripsi: "" },
                { judul: "", deskripsi: "" },
                { judul: "", deskripsi: "" },
              ],
      };
    }
    return {
      hero_judul: "",
      hero_slogan: "",
      hero_foto_key: "",
      hero_foto_url: "",
      nomor_whatsapp: "",
      about_cerita: "",
      about_nilai: [
        { judul: "", deskripsi: "" },
        { judul: "", deskripsi: "" },
        { judul: "", deskripsi: "" },
      ],
      alamat: "",
      instagram_url: "",
      youtube_url: "",
      facebook_url: "",
      tiktok_url: "",
    };
  });

  const [successNotice, setSuccessNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    if (settings) {
      setFormData({
        ...settings,
        about_nilai:
          settings.about_nilai && settings.about_nilai.length === 3
            ? settings.about_nilai
            : [
                { judul: "", deskripsi: "" },
                { judul: "", deskripsi: "" },
                { judul: "", deskripsi: "" },
              ],
      });
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(false);

    updateMutation.mutate(formData, {
      onSuccess: () => {
        setSuccessNotice(true);
        setTimeout(() => setSuccessNotice(false), 4000);
      },
      onError: (err: unknown) => {
        setErrorNotice(err instanceof Error ? err.message : "Gagal menyimpan pengaturan situs.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SECTION 1: HERO & BANNER */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-base font-bold text-coffee-900">
          1. Hero & Banner Beranda
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Tampilan pembuka yang langsung dilihat pengunjung ketika membuka web profil.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-coffee-900 mb-1">
              Judul Utama (Hero Title) <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="Contoh: Kelompok Tani Lembah Kopi"
              value={formData.hero_judul}
              onChange={(e) =>
                setFormData({ ...formData, hero_judul: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-900 mb-1">
              Slogan Singkat (Tagline)
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="Contoh: Menghadirkan Kopi Glodogan Berkualitas dan Berkelanjutan"
              value={formData.hero_slogan}
              onChange={(e) =>
                setFormData({ ...formData, hero_slogan: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
            />
          </div>

          <ImageUploadField
            label="Foto Spanduk / Background Banner"
            folder="hero"
            currentKey={formData.hero_foto_key}
            currentUrl={formData.hero_foto_url}
            onSuccess={(key, url) =>
              setFormData({
                ...formData,
                hero_foto_key: key,
                hero_foto_url: url,
              })
            }
            onRemove={() =>
              setFormData({
                ...formData,
                hero_foto_key: "",
                hero_foto_url: "",
              })
            }
          />
        </div>
      </div>

      {/* SECTION 2: TENTANG & 3 NILAI UTAMA */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-base font-bold text-coffee-900">
          2. Cerita Narasi & 3 Nilai Komunitas
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Perkenalkan sejarah kelompok tani dan 3 pilar utama komitmen petani di Desa Glodogan.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-coffee-900 mb-1">
              Cerita & Profil Singkat Kelompok Tani (2-3 Paragraf)
            </label>
            <textarea
              rows={5}
              maxLength={5000}
              placeholder="Tuliskan latar belakang kelompok tani, komitmen lingkungan, dan keunikan tanah Desa Glodogan..."
              value={formData.about_cerita}
              onChange={(e) =>
                setFormData({ ...formData, about_cerita: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-coffee-900">
              3 Poin Nilai / Keunggulan Komunitas
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.about_nilai.map((val, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-cream-50 p-3.5 space-y-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Nilai #{idx + 1}
                  </span>
                  <input
                    type="text"
                    maxLength={60}
                    placeholder={`Judul Nilai ${idx + 1}`}
                    value={val.judul}
                    onChange={(e) => {
                      const next = [...formData.about_nilai];
                      next[idx] = { ...next[idx], judul: e.target.value };
                      setFormData({ ...formData, about_nilai: next });
                    }}
                    className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-coffee-900 focus:outline-hidden"
                  />
                  <textarea
                    rows={3}
                    maxLength={200}
                    placeholder="Deskripsi singkat..."
                    value={val.deskripsi}
                    onChange={(e) => {
                      const next = [...formData.about_nilai];
                      next[idx] = { ...next[idx], deskripsi: e.target.value };
                      setFormData({ ...formData, about_nilai: next });
                    }}
                    className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-coffee-900 focus:outline-hidden"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: KONTAK & MEDIA SOSIAL */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-base font-bold text-coffee-900">
          3. Kontak Sekretariat & Media Sosial
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Informasi narahubung resmi dan tautan sosial media di footer profil publik.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-coffee-900 mb-1">
              Nomor WhatsApp Narahubung Resmi
            </label>
            <input
              type="text"
              placeholder="Contoh: 0812-3456-7890"
              value={formData.nomor_whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, nomor_whatsapp: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
            />
            <span className="text-[10px] text-text-muted">
              Format otomatis disesuaikan ke format internasional (62xxx).
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-900 mb-1">
              Alamat Sekretariat / Kebun
            </label>
            <input
              type="text"
              maxLength={500}
              placeholder="Contoh: Dusun, Desa, Kecamatan, Kabupaten, Provinsi"
              value={formData.alamat}
              onChange={(e) =>
                setFormData({ ...formData, alamat: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-900 mb-1">
              Tautan Instagram
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/lembahkopi"
              value={formData.instagram_url}
              onChange={(e) =>
                setFormData({ ...formData, instagram_url: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-900 mb-1">
              Tautan Saluran YouTube
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/@lembahkopi"
              value={formData.youtube_url}
              onChange={(e) =>
                setFormData({ ...formData, youtube_url: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-900 mb-1">
              Tautan Facebook
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/lembahkopi"
              value={formData.facebook_url}
              onChange={(e) =>
                setFormData({ ...formData, facebook_url: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-900 mb-1">
              Tautan TikTok
            </label>
            <input
              type="url"
              placeholder="https://tiktok.com/@lembahkopi"
              value={formData.tiktok_url}
              onChange={(e) =>
                setFormData({ ...formData, tiktok_url: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-cream-50 px-3.5 py-2 text-sm text-coffee-900 focus:border-primary focus:bg-surface focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* FEEDBACK & SUBMIT BUTTON */}
      {errorNotice && (
        <div className="rounded-xl border border-danger/25 bg-danger-tint p-3.5 text-xs font-medium text-danger-ink">
          {errorNotice}
        </div>
      )}

      {successNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-success/25 bg-success-tint p-3.5 text-xs font-medium text-success-ink">
          <Check className="h-4 w-4 text-success" />
          <span>Pengaturan situs web berhasil diperbarui dan disimpan!</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition min-h-10"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Save className="h-4 w-4 text-white" />
          )}
          <span>Simpan Seluruh Pengaturan</span>
        </button>
      </div>
    </form>
  );
}
