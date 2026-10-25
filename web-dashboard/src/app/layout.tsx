import type { Metadata } from "next";
import QueryProvider from "@/components/providers/query-provider";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Lembah Kopi Dashboard",
  description: "Sistem Perkebunan & Traceability Lembah Kopi",
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
