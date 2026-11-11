import { MessageCircle } from "lucide-react";
import { formatWhatsAppUrl } from "@/lib/utils";

interface WhatsAppFloatProps {
  nomorWhatsApp?: string;
  judul?: string;
}

/** Tombol WhatsApp mengambang (DESIGN.md 4.9). Tidak tampil bila nomor belum diisi di CMS. */
export function WhatsAppFloat({ nomorWhatsApp, judul }: WhatsAppFloatProps) {
  const url = formatWhatsAppUrl(
    nomorWhatsApp,
    `Halo Pengurus ${judul || "Lembah Kopi"}, saya ingin bertanya seputar kelompok tani dan produk kopi.`
  );
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Hubungi Pengurus via WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp text-surface shadow-lg transition-transform duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
