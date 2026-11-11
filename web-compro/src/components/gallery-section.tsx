import type { GalleryPhoto } from "@/types";
import { SectionHeading } from "@/components/section-heading";
import { GalleryGrid } from "@/components/gallery-grid";

interface GallerySectionProps {
  gallery: GalleryPhoto[];
}

export function GallerySection({ gallery }: GallerySectionProps) {
  if (gallery.length === 0) return null;

  return (
    <section id="galeri" className="section-y bg-cream-50">
      <div className="container-lk">
        <div data-reveal>
          <SectionHeading
            eyebrow="Galeri Dokumentasi"
            title="Momen Panen & Pemrosesan"
            subtitle="Potret kebersamaan petani Lembah Kopi dari kebun hingga stasiun penjemuran."
          />
        </div>

        <GalleryGrid gallery={gallery} />
      </div>
    </section>
  );
}
