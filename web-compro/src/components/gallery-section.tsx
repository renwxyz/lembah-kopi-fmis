import type { GalleryPhoto } from "@/types";

interface GallerySectionProps {
  gallery: GalleryPhoto[];
}

export function GallerySection({ gallery }: GallerySectionProps) {
  if (gallery.length === 0) return null;

  return (
    <section id="galeri" className="py-20 bg-[#FAF8F5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9E8E82]">
            Galeri Dokumentasi
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#2A1810] mt-1.5">
            Momen Panen & Pemrosesan
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#8A7669]">
            Potret kebersamaan petani Lembah Kopi dari kebun hingga stasiun penjemuran.
          </p>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#2A1810]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map((photo) => (
            <div
              key={photo.id_foto}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-[#E8E2DC] bg-[#F4F0EC] shadow-xs"
            >
              {photo.foto_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.foto_url}
                  alt={photo.keterangan || "Aktivitas Lembah Kopi"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {photo.keterangan && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-[11px] font-medium text-white leading-tight">
                    {photo.keterangan}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

