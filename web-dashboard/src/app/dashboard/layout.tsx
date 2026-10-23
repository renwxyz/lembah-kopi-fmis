import type { Metadata } from "next";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard - Lembah Kopi",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
