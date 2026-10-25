import Link from "next/link";
import { Sprout } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E2DC]/80 bg-[#FAF8F5]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A1810] text-white shadow-xs">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-[#2A1810]">
              Lembah Kopi
            </span>
            <span className="block text-[10px] text-[#6E5D53] font-medium leading-none">
              Desa Glodogan
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#6E5D53]">
          <a href="#about" className="hover:text-[#2A1810] transition">
            Tentang Kami
          </a>
          <a href="#katalog" className="hover:text-[#2A1810] transition">
            Katalog Kopi
          </a>
          <a href="#media" className="hover:text-[#2A1810] transition">
            Video & Media
          </a>
          <a href="#agenda" className="hover:text-[#2A1810] transition">
            Agenda
          </a>
          <a href="#galeri" className="hover:text-[#2A1810] transition">
            Galeri Foto
          </a>
          <a href="#kontak" className="hover:text-[#2A1810] transition">
            Kontak
          </a>
        </nav>

        <div>
          <a
            href="#katalog"
            className="inline-flex items-center rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2317] transition"
          >
            Lihat Produk
          </a>
        </div>
      </div>
    </header>
  );
}

