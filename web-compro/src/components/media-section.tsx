import type { MediaEmbed } from "@/types";

interface MediaSectionProps {
  media: MediaEmbed[];
}

export function MediaSection({ media }: MediaSectionProps) {
  // Hanya ambil media yang berstatus tampil
  const visibleMedia = media.filter((m) => m.tampil);

  if (visibleMedia.length === 0) return null;

  return (
    <section id="media" className="py-20 bg-[#FAF8F5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9E8E82]">
            Dokumentasi & Sorotan
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#2A1810] mt-1.5">
            Aktivitas di Kebun & Komunitas
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#8A7669]">
            Tayangan video dan unggahan cerita keseharian petani dari saluran YouTube dan Instagram kami.
          </p>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#2A1810]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visibleMedia.map((item) => (
            <div
              key={item.id_media}
              className="rounded-3xl border border-[#E8E2DC] bg-white overflow-hidden shadow-xs hover:shadow-md transition"
            >
              <div
                className={`relative w-full bg-black/5 ${
                  item.tipe === "INSTAGRAM"
                    ? "h-[480px] sm:h-[520px]"
                    : "aspect-video"
                }`}
              >
                {item.tipe === "YOUTUBE" ? (
                  <iframe
                    src={item.embed_url}
                    title="Lembah Kopi YouTube Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                ) : (
                  <iframe
                    src={item.embed_url}
                    title="Lembah Kopi Instagram Post"
                    className="h-full w-full border-0 bg-white"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

