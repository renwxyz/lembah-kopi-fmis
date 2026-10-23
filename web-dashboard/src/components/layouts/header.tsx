"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { useSession } from "@/features/auth/hooks/use-session";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const sessionQuery = useSession();
  const user = sessionQuery.data;

  const pageMeta = useMemo(() => {
    if (pathname === "/dashboard/lahan") {
      return {
        title: "Pemetaan & Data Lahan",
        subtitle: "Kelola petak kebun, data pemilik, dan batas area geografis",
      };
    }
    return {
      title: "Peta Sebaran Lahan Kebun",
      subtitle: "Klik polygon pada peta untuk melihat detail petak",
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#E8E2DC] bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Buka menu navigasi"
          aria-expanded={false}
          className="shrink-0 rounded-lg p-2 text-[#2A1810] transition-colors hover:bg-[#F4F0EC] lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="min-w-0">
          <h2 className="truncate font-heading text-base font-bold text-[#2A1810] sm:text-lg">
            {pageMeta.title}
          </h2>
          <p className="truncate text-xs text-[#6E5D53]">
            {pageMeta.subtitle}
          </p>
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-semibold text-[#2A1810]">
            {user?.nama_lengkap ?? "Admin Lembah Kopi"}
          </p>
          <p className="text-[10px] text-[#9E8E82]">
            {user?.role === "SUPER_ADMIN"
              ? "Super Admin"
              : "Pengurus Kelompok Tani"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8E2DC] bg-[#F4F0EC] text-[#2A1810]">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
