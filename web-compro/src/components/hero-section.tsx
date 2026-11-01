import { ArrowRight, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/types";
import { formatWhatsAppUrl } from "@/lib/utils";

interface HeroSectionProps {
  settings: SiteSettings;
}

export function HeroSection({ settings }: HeroSectionProps) {
  const waUrl = formatWhatsAppUrl(
    settings.nomor_whatsapp,
    `Halo Pengurus ${settings.hero_judul || "Lembah Kopi"}, saya ingin bertanya seputar kelompok tani dan produk kopi.`
  );

  return (
    <section className="relative min-h-[560px] flex items-center justify-center overflow-hidden bg-[#2A1810] text-white">
      {/* Background Image / Overlay */}
      {settings.hero_foto_url ? (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.hero_foto_url}
            alt="Lembah Kopi Banner"
            className="h-full w-full object-cover opacity-35 filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A1810] via-black/40 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-radial from-[#3D2317] to-[#2A1810]" />
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md mb-6">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Kelompok Tani Desa Glodogan</span>
        </div>

        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
          {settings.hero_judul || "Kelompok Tani Lembah Kopi"}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-[#E8E2DC] font-normal leading-relaxed text-balance">
          {settings.hero_slogan ||
            "Pemberdayaan petani kopi lokal, menjaga tradisi pascapanen berkualitas tinggi di lereng Desa Glodogan."}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Hubungi Pengurus via WhatsApp</span>
            </a>
          )}

          <a
            href="#katalog"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition"
          >
            <span>Jelajahi Varietas Kopi</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

