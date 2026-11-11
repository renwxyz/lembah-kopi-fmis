import Image from "next/image";
import { MapPin, MessageCircle, Share2, Video } from "lucide-react";
import type { SiteSettings } from "@/types";
import { formatWhatsAppUrl, formatPhoneDisplay } from "@/lib/utils";

interface FooterProps {
  settings: SiteSettings;
}

const NAV_LINKS = [
  { href: "#about", label: "Tentang Kami" },
  { href: "#katalog", label: "Katalog Kopi" },
  { href: "#media", label: "Video & Media" },
  { href: "#agenda", label: "Agenda" },
  { href: "#galeri", label: "Galeri Foto" },
];

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  // Alamat hanya dari CMS; kosong = baris alamat disembunyikan.
  const alamat = settings.alamat?.trim();
  const waUrl = formatWhatsAppUrl(
    settings.nomor_whatsapp,
    `Halo Pengurus ${settings.hero_judul || "Lembah Kopi"}, saya ingin bertanya seputar kelompok tani dan produk kopi.`
  );

  const socials = [
    { url: settings.instagram_url, label: "Instagram", Icon: Share2 },
    { url: settings.youtube_url, label: "YouTube", Icon: Video },
    { url: settings.facebook_url, label: "Facebook", Icon: Share2 },
    { url: settings.tiktok_url, label: "TikTok", Icon: Video },
  ].filter((s) => s.url);

  return (
    <footer id="kontak" className="border-t border-border bg-cream-50">
      <div className="container-lk pb-8 pt-16">
        <div className="grid grid-cols-1 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kolom 1: logo dan profil */}
          <div>
            <Image
              src="/logo-glodogan.png"
              alt="Logo Kelompok Tani Kopi Glodogan"
              width={104}
              height={104}
              className="h-[104px] w-[104px]"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              Kelompok Tani Desa Glodogan yang berfokus pada pelestarian kebun kopi lokal, perbaikan mutu pascapanen, dan kesejahteraan anggota tani.
            </p>
          </div>

          {/* Kolom 2: navigasi */}
          <nav aria-label="Navigasi footer">
            <h4 className="font-heading text-base font-bold text-coffee-900">
              Navigasi
            </h4>
            <ul className="mt-4 space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="inline-flex min-h-10 items-center text-[15px] text-text-muted transition-colors hover:text-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolom 3: kontak sekretariat */}
          <div>
            <h4 className="font-heading text-base font-bold text-coffee-900">
              Sekretariat &amp; Kebun
            </h4>
            <div className="mt-4 space-y-3 text-[15px] text-text-muted">
              {alamat && (
                <p className="flex items-start gap-2.5">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{alamat}</span>
                </p>
              )}
              {waUrl && (
                <p className="flex items-center gap-2.5">
                  <MessageCircle
                    className="h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-primary"
                  >
                    {formatPhoneDisplay(settings.nomor_whatsapp)} (WhatsApp Resmi)
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Kolom 4: sosial dan ajakan WhatsApp (tombol hanya bila nomor tersedia) */}
          <div>
            <h4 className="font-heading text-base font-bold text-coffee-900">
              Ikuti Kami
            </h4>
            <p className="mt-4 text-[15px] text-text-muted">
              Dapatkan pembaruan langsung proses petik dan panen kopi kami melalui kanal media sosial:
            </p>
            {socials.length > 0 && (
              <ul className="mt-4 flex flex-wrap items-center gap-3">
                {socials.map(({ url, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-coffee-900 transition-colors hover:bg-primary-tint hover:text-primary"
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm mt-5 whitespace-normal! py-2 text-center leading-snug"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Hubungi Pengurus via WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Hak cipta */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-[13px] text-text-muted sm:flex-row">
          <p>
            © {currentYear} Kelompok Tani Lembah Kopi Glodogan. All rights reserved.
          </p>
          <p>Dikelola secara mandiri dengan sistem profil terintegrasi.</p>
          {/* TODO teks: kredit wajib lisensi CC BY-SA 4.0 selama foto hero sementara dipakai */}
          {!settings.hero_foto_url && (
            <p>
              Foto hero sementara:{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Perkebunan_Kopi_Jangkat_Merangin.jpg"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-primary"
              >
                Roby diery, CC BY-SA 4.0
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
