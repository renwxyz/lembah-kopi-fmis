"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryPhoto } from "@/types";

interface GalleryGridProps {
  gallery: GalleryPhoto[];
}

/** Grid foto bersudut 16px dengan tampilan besar (lightbox) saat diklik (DESIGN.md 5.1 butir 7). */
export function GalleryGrid({ gallery }: GalleryGridProps) {
  const photos = gallery.filter((p) => p.foto_url);
  const [index, setIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setIndex(null);
    triggerRef.current?.focus();
  }, []);

  const move = useCallback(
    (delta: number) => {
      setIndex((i) =>
        i === null ? i : (i + delta + photos.length) % photos.length
      );
    },
    [photos.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, close, move]);

  const active = index !== null ? photos[index] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.id_foto} data-reveal>
            <button
              type="button"
              onClick={(e) => {
                triggerRef.current = e.currentTarget;
                setIndex(i);
              }}
              aria-label={`Perbesar foto: ${photo.keterangan || "Aktivitas Lembah Kopi"}`}
              className="card-zoom group relative block aspect-square w-full overflow-hidden rounded-media border border-border bg-primary-tint"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.foto_url}
                alt={photo.keterangan || "Aktivitas Lembah Kopi"}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              {photo.keterangan && (
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-coffee-900/85 via-coffee-900/20 to-transparent p-3 text-left text-[13px] font-medium leading-tight text-surface opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {photo.keterangan}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan besar foto galeri"
          className="on-dark fixed inset-0 z-[60] flex items-center justify-center bg-coffee-900/90 p-4"
          onClick={close}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Tutup tampilan besar"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface/15 text-surface hover:bg-surface/25"
          >
            <X className="h-6 w-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(-1);
                }}
                aria-label="Foto sebelumnya"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/15 text-surface hover:bg-surface/25 sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(1);
                }}
                aria-label="Foto berikutnya"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/15 text-surface hover:bg-surface/25 sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <figure
            className="flex max-h-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.foto_url}
              alt={active.keterangan || "Aktivitas Lembah Kopi"}
              className="max-h-[78vh] w-auto max-w-full rounded-media object-contain"
            />
            {active.keterangan && (
              <figcaption className="mt-4 max-w-2xl text-center text-base text-surface">
                {active.keterangan}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
