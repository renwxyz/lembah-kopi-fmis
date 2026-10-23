"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Sprout,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/features/auth/hooks/use-logout";

const navigation = [
  { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pemetaan Lahan", href: "/dashboard/lahan", icon: Map },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.replace("/login"),
    });
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#E8E2DC] bg-white transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E8E2DC] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A1810] text-white">
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

      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
        <nav className="space-y-1.5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9E8E82]">
            Menu Utama
          </p>

          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-[#2A1810] text-white shadow-sm"
                    : "text-[#6E5D53] hover:bg-[#F4F0EC] hover:text-[#2A1810]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-white" : "text-[#9E8E82]"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E8E2DC] pt-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            Keluar Akun
          </button>
        </div>
      </div>
    </aside>
  );
}
