import { ArrowRight, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/types";
import { formatWhatsAppUrl } from "@/lib/utils";

export const DEFAULT_HERO_PHOTO = "/hero-default.jpg";

interface HeroSectionProps {
  settings: SiteSettings;
}

export function HeroSection({ settings }: HeroSectionProps) {
  const waUrl = formatWhatsAppUrl(
    settings.nomor_whatsapp,
    `Halo Pengurus ${settings.hero_judul || "Lembah Kopi"}, saya ingin bertanya seputar kelompok tani dan produk kopi.`
  );

  return (
    <section className="on-dark relative flex min-h-[max(70svh,560px)] items-center overflow-hidden pt-[70px] text-surface lg:min-h-[max(100svh,640px)]">
      {/* Slot foto hero: diisi dari CMS (hero_foto_url). Bila kosong, dipakai foto sementara
          /hero-default.jpg (kredit di docs/referensi/KREDIT-FOTO.md dan di footer). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={settings.hero_foto_url || DEFAULT_HERO_PHOTO}
        alt="Kebun kopi Kelompok Tani Lembah Kopi"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Overlay: lebih pekat di kiri tempat teks berada (75% turun ke 35%) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-coffee-800/75 via-coffee-800/55 to-coffee-800/35"
      />
      {/* Gradasi atas agar menu putih pada navbar transparan tetap terbaca di atas langit terang */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-coffee-900/70 to-transparent"
      />

      <div className="container-lk relative z-10 py-16 lg:py-24">
        <div className="max-w-2xl">
          <h1 className="font-heading text-[2.25rem] font-bold leading-[1.1] tracking-tight text-surface sm:text-5xl lg:text-[60px] text-balance">
            {settings.hero_judul || "Kelompok Tani Lembah Kopi"}
          </h1>

          <p className="mt-5 text-lg font-semibold leading-relaxed text-sage-300 sm:text-xl text-balance">
            {settings.hero_slogan ||
              "Pemberdayaan petani kopi lokal, menjaga tradisi pascapanen berkualitas tinggi di lereng Desa Glodogan."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Hubungi Pengurus via WhatsApp
              </a>
            )}
            <a href="#katalog" className="btn btn-photo w-full sm:w-auto">
              Jelajahi Varietas Kopi
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
