"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { id: "about", label: "Tentang Kami" },
  { id: "katalog", label: "Katalog Kopi" },
  { id: "media", label: "Video & Media" },
  { id: "agenda", label: "Agenda" },
  { id: "galeri", label: "Galeri Foto" },
  { id: "kontak", label: "Kontak" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // Transparan di atas foto hero, menjadi solid (dengan bayangan tipis) setelah di-scroll.
  // Saat panel menu HP terbuka, navbar selalu solid.
  const solid = scrolled || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Item menu aktif mengikuti section yang sedang terlihat
  useEffect(() => {
    const sections = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Panel mobile: tutup dengan Escape, kunci scroll latar
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full transition-[background-color,box-shadow] duration-200 ${
        solid
          ? "bg-cream-50 shadow-[0_1px_8px_color-mix(in_srgb,var(--coffee-900)_10%,transparent)]"
          : "on-dark bg-transparent"
      }`}
    >
      <div className="container-lk flex h-[70px] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full"
          onClick={() => setOpen(false)}
        >
          {/* Logo olive di atas latar terang, logo putih di atas foto */}
          <Image
            src="/logo-glodogan.png"
            alt="Logo Kelompok Tani Kopi Glodogan"
            width={44}
            height={44}
            priority
            className={solid ? "h-11 w-11" : "hidden"}
          />
          <Image
            src="/logo-glodogan-putih.png"
            alt="Logo Kelompok Tani Kopi Glodogan"
            width={44}
            height={44}
            priority
            className={solid ? "hidden" : "h-11 w-11"}
          />
          <div>
            <span
              className={`block text-base font-bold leading-tight tracking-tight ${
                solid ? "text-coffee-900" : "text-surface"
              }`}
            >
              Lembah Kopi
            </span>
            <span
              className={`block text-[11px] font-medium leading-tight ${
                solid ? "text-text-muted" : "text-surface/85"
              }`}
            >
              Desa Glodogan
            </span>
          </div>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              const cls = solid
                ? isActive
                  ? "bg-primary-tint text-primary"
                  : "text-coffee-900 hover:bg-primary-tint hover:text-primary"
                : isActive
                  ? "bg-surface/20 text-surface"
                  : "text-surface hover:bg-surface/15";
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`inline-flex min-h-10 items-center rounded-full px-4 text-[15px] font-medium transition-colors duration-200 ${cls}`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href="#katalog" className="btn btn-primary btn-sm hidden lg:inline-flex">
            Lihat Produk
          </a>
          <button
            type="button"
            className={`flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${
              solid
                ? "text-coffee-900 hover:bg-primary-tint"
                : "text-surface hover:bg-surface/15"
            }`}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="panel-menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Panel penuh untuk layar < 1024px */}
      {open && (
        <div
          id="panel-menu-mobile"
          className="fixed inset-x-0 bottom-0 top-[70px] overflow-y-auto border-t border-border bg-cream-50 lg:hidden"
        >
          <nav aria-label="Navigasi utama" className="container-lk py-6">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-12 items-center rounded-full px-5 text-lg font-medium ${
                        isActive
                          ? "bg-primary-tint text-primary"
                          : "text-coffee-900 hover:bg-primary-tint"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
            <a
              href="#katalog"
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-6 w-full"
            >
              Lihat Produk
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
