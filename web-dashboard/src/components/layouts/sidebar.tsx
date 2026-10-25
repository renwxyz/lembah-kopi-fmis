"use client";

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
  Sprout,
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
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#E8E2DC] bg-white transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E8E2DC] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A1810] text-white shadow-xs">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-bold text-[#2A1810]">
              Lembah Kopi
            </h1>
            <p className="text-[10px] text-[#6E5D53]">Management System</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu navigasi"
          className="rounded-lg p-2 text-[#6E5D53] hover:bg-[#F4F0EC] lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav List with Sections */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
        <nav className="space-y-4">
          {visibleSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9E8E82] mb-1.5">
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
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-[#2A1810] text-white shadow-xs"
                          : "text-[#6E5D53] hover:bg-[#F4F0EC] hover:text-[#2A1810]"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-white" : "text-[#9E8E82]"
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer User Profile & Logout */}
        <div className="border-t border-[#E8E2DC] pt-4 space-y-2">
          {user && (
            <div className="flex items-center gap-2.5 rounded-xl bg-[#FAF8F5] p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2A1810] text-xs font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#2A1810]">
                  {user.nama_lengkap}
                </p>
                <p className="truncate text-[10px] text-[#8A7669]">
                  {isSuperAdmin ? "Super Admin" : "Kelompok Tani"}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5 text-red-500" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
