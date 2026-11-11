"use client";

import Image from "next/image";
import logoGlodogan from "@/assets/logo-glodogan.png";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Map,
  Users,
  Activity,
  Wheat,
  Layers,
  QrCode,
  ScrollText,
  LogOut,
  X,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useSession } from "@/features/auth/hooks/use-session";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
  superAdminOnly?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "Ringkasan",
    items: [
      { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Kebun & Anggota",
    items: [
      { name: "Pemetaan Lahan", href: "/dashboard/lahan", icon: Map },
      { name: "Data Petani", href: "/dashboard/petani", icon: Users },
      { name: "Agronomi & Tanah", href: "/dashboard/agronomi", icon: Activity },
    ],
  },
  {
    title: "Produksi & Pascapanen",
    items: [
      { name: "Panen Ceri", href: "/dashboard/panen", icon: Wheat },
      { name: "Pascaproses & Batch", href: "/dashboard/batch", icon: Layers },
      { name: "Traceability", href: "/dashboard/traceability", icon: QrCode },
    ],
  },
  {
    title: "Publikasi & CMS",
    items: [
      { name: "Community Profile", href: "/dashboard/cms", icon: Globe },
    ],
  },
  {
    title: "Sistem & Audit",
    superAdminOnly: true,
    items: [
      { name: "Audit Trail", href: "/dashboard/audit-log", icon: ScrollText },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const sessionQuery = useSession();
  const user = sessionQuery.data;
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.replace("/login"),
    });
  };

  const initial = user?.nama_lengkap
    ? user.nama_lengkap.charAt(0).toUpperCase()
    : "LK";

  const visibleSections = navSections.filter(
    (section) => !section.superAdminOnly || isSuperAdmin
  );

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
        <div className="flex items-center gap-3">
          <Image
            src={logoGlodogan}
            alt="Logo Kelompok Tani Kopi Glodogan"
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10"
          />
          <div>
            <h1 className="font-heading text-base font-bold leading-tight text-coffee-900">
              Lembah Kopi
            </h1>
            <p className="text-[11px] leading-tight text-text-muted">
              Management System
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu navigasi"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-primary-tint lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Menu */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
        <nav aria-label="Navigasi dashboard" className="space-y-5">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {section.title}
              </p>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href ||
                        pathname?.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-3 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-primary-tint text-primary"
                          : "text-text-muted hover:bg-primary-wash hover:text-coffee-900"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profil pengguna dan keluar */}
        <div className="mt-6 space-y-2 border-t border-border pt-4">
          {user && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-cream-50 p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-coffee-900">
                  {user.nama_lengkap}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {isSuperAdmin ? "Super Admin" : "Kelompok Tani"}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-danger transition-colors hover:bg-danger-tint disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
