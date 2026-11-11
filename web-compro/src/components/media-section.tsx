import type { MediaEmbed } from "@/types";
import { SectionHeading } from "@/components/section-heading";

interface MediaSectionProps {
  media: MediaEmbed[];
}

export function MediaSection({ media }: MediaSectionProps) {
  // Hanya ambil media yang berstatus tampil
  const visibleMedia = media.filter((m) => m.tampil);

  if (visibleMedia.length === 0) return null;

  return (
    <section id="media" className="section-y bg-cream-50">
      <div className="container-lk">
        <div data-reveal>
          <SectionHeading
            eyebrow="Dokumentasi & Sorotan"
            title="Aktivitas di Kebun & Komunitas"
            subtitle="Tayangan video dan unggahan cerita keseharian petani dari saluran YouTube dan Instagram kami."
          />
        </div>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleMedia.map((item) => (
            <li
              key={item.id_media}
              data-reveal
              className="card-lift overflow-hidden rounded-card border border-border bg-surface"
            >
              <div
                className={`relative w-full bg-primary-wash ${
                  item.tipe === "INSTAGRAM"
                    ? "h-[480px] sm:h-[520px]"
                    : "aspect-video"
                }`}
              >
                {item.tipe === "YOUTUBE" ? (
                  <iframe
                    src={item.embed_url}
                    title="Lembah Kopi YouTube Video"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                ) : (
                  <iframe
                    src={item.embed_url}
                    title="Lembah Kopi Instagram Post"
                    loading="lazy"
                    className="h-full w-full border-0 bg-surface"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
