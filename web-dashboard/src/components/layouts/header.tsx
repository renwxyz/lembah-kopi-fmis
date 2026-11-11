"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { useSession } from "@/features/auth/hooks/use-session";
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const sessionQuery = useSession();
  const user = sessionQuery.data;
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const pageMeta = useMemo(() => {
    if (pathname?.startsWith("/dashboard/lahan")) {
      return {
        title: "Pemetaan & Geospasial Lahan",
        subtitle: "Kelola petak kebun, batas polygon spasial, dan profil lahan 360°",
      };
    }
    if (pathname?.startsWith("/dashboard/petani")) {
      return {
        title: "Manajemen Anggota Petani",
        subtitle: "Kelola profil dan relasi kepemilikan kebun anggota kelompok tani",
      };
    }
    if (pathname?.startsWith("/dashboard/agronomi")) {
      return {
        title: "Agronomi & Monitoring Kebun",
        subtitle: "Parameter tanah 6-in-1, siklus pemupukan, dan penanganan hama",
      };
    }
    if (pathname?.startsWith("/dashboard/panen")) {
      return {
        title: "Pencatatan Hasil Panen Ceri",
        subtitle: "Timbangan ceri harian dan sortasi petik merah vs pelangi",
      };
    }
    if (pathname?.startsWith("/dashboard/batch")) {
      return {
        title: "Pascaproses & Tracking Batch",
        subtitle: "Rantai olah fermentasi, drying, hingga rendemen green bean kering",
      };
    }
    if (pathname?.startsWith("/dashboard/audit-log")) {
      return {
        title: "Audit Trail",
        subtitle: "Riwayat aktivitas admin dan percobaan login",
      };
    }
    if (pathname?.startsWith("/dashboard/traceability")) {
      return {
        title: "Matriks Penelusuran Asal Lahan",
        subtitle: "Verifikasi silsilah kebun, elevasi, varietas, dan komposisi batch",
      };
    }
    if (pathname?.startsWith("/dashboard/cms")) {
      return {
        title: "Manajemen Konten Publik (CMS)",
        subtitle: "Kelola profil kelompok tani, katalog kopi, agenda, dan galeri website",
      };
    }
    return {
      title: "Ringkasan & Peta Sebaran Lahan",
      subtitle: "Monitoring visual kebun dan operasional perkebunan Desa Glodogan",
    };
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Buka menu navigasi"
            aria-expanded={false}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-coffee-900 transition-colors hover:bg-primary-tint lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="min-w-0">
            <h2 className="truncate font-heading text-base font-bold text-coffee-900 sm:text-lg">
              {pageMeta.title}
            </h2>
            <p className="truncate text-sm text-text-muted">
              {pageMeta.subtitle}
            </p>
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-coffee-900">
              {user?.nama_lengkap ?? "Admin Lembah Kopi"}
            </p>
            <p className="text-xs text-text-muted">
              {user?.role === "SUPER_ADMIN"
                ? "Super Admin"
                : "Pengurus Kelompok Tani"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            title="Kelola Profil & Kata Sandi"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-primary-tint text-primary transition-colors hover:bg-border"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </header>

      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}
