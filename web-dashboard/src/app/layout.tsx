import type { Metadata } from "next";
import QueryProvider from "@/components/providers/query-provider";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lembah Kopi FMIS — Sistem Informasi Perkebunan",
    template: "%s | Lembah Kopi FMIS",
  },
  description:
    "Sistem Informasi Manajemen Perkebunan & Ketertelusuran (FMIS) Lembah Kopi Glodogan",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
