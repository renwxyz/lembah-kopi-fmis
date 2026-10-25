import {
  MapPin,
  MessageCircle,
  Sprout,
  Video,
  Share2,
} from "lucide-react";
import type { SiteSettings } from "@/types";

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="kontak" className="bg-[#2A1810] text-[#E8E2DC] pt-16 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/10">
          {/* Kolom 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2A1810]">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="font-heading text-lg font-bold text-white">
                {settings.hero_judul || "Lembah Kopi"}
              </span>
            </div>
            <p className="text-xs text-[#C6BCB3] leading-relaxed max-w-sm">
              Kelompok Tani Desa Glodogan yang berfokus pada pelestarian kebun kopi lokal, perbaikan mutu pascapanen, dan kesejahteraan anggota tani.
            </p>
          </div>

          {/* Kolom 2: Kontak Sekretariat */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Sekretariat & Kebun
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-[#C6BCB3]">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#C28E58]" />
              <span>
                {settings.alamat ||
                  "Desa Glodogan, Klaten Selatan, Jawa Tengah, Indonesia."}
              </span>
            </div>
            {settings.nomor_whatsapp && (
              <div className="flex items-center gap-2.5 text-xs text-[#C6BCB3]">
                <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <a
                  href={`https://wa.me/${settings.nomor_whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  +{settings.nomor_whatsapp} (WhatsApp Resmi)
                </a>
              </div>
            )}
          </div>

          {/* Kolom 3: Sosial Media */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Ikuti Kami
            </h4>
            <p className="text-xs text-[#C6BCB3]">
              Dapatkan pembaruan langsung proses petik dan panen kopi kami melalui kanal media sosial:
            </p>
            <div className="flex items-center gap-3 pt-1">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition"
                  title="Instagram"
                >
                  <Share2 className="h-3.5 w-3.5 text-pink-400" />
                  <span>Instagram</span>
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition"
                  title="YouTube"
                >
                  <Video className="h-3.5 w-3.5 text-red-400" />
                  <span>YouTube</span>
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition"
                  title="Facebook"
                >
                  <Share2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Facebook</span>
                </a>
              )}
              {settings.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition"
                  title="TikTok"
                >
                  <Video className="h-3.5 w-3.5 text-emerald-400" />
                  <span>TikTok</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A69B91]">
          <p>
            © {currentYear} Kelompok Tani Lembah Kopi Glodogan. All rights reserved.
          </p>
          <p className="mt-2 sm:mt-0">
            Dikelola secara mandiri dengan sistem profil terintegrasi.
          </p>
        </div>
      </div>
    </footer>
  );
}

