import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kelompok Tani Lembah Kopi | Desa Glodogan",
  description:
    "Profil publik Kelompok Tani Lembah Kopi di Desa Glodogan. Showcase varietas biji kopi pilihan, dokumentasi video, dan pemesanan via WhatsApp.",
  keywords: [
    "kopi glodogan",
    "lembah kopi",
    "kopi arabika",
    "kopi robusta",
    "kelompok tani kopi",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

