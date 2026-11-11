import { MapPin } from "lucide-react";

interface LocationSectionProps {
  alamat?: string;
}

/**
 * Lokasi: kiri judul + alamat + tombol, kanan peta bersudut 24px (DESIGN.md 5.1 butir 5).
 * Hanya tampil bila alamat tersedia. Peta memakai pencarian alamat tersebut, tanpa koordinat karangan.
 */
export function LocationSection({ alamat }: LocationSectionProps) {
  const alamatBersih = alamat?.trim();
  if (!alamatBersih) return null;

  const query = encodeURIComponent(alamatBersih);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;

  return (
    <section id="lokasi" className="section-y bg-primary-wash">
      <div className="container-lk grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div data-reveal>
          {/* Judul memakai teks yang sudah ada di footer ("Sekretariat & Kebun") */}
          <h2 className="font-heading text-[1.75rem] font-bold leading-[1.15] text-coffee-900 sm:text-3xl lg:text-[40px]">
            Sekretariat &amp; Kebun
          </h2>
          <p className="mt-6 flex items-start gap-3 text-lg text-text-muted">
            <MapPin
              className="mt-1 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{alamatBersih}</span>
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary mt-8"
          >
            Buka di Google Maps
          </a>
        </div>

        <div
          data-reveal
          className="aspect-[4/3] overflow-hidden rounded-card border border-border bg-surface"
        >
          <iframe
            src={embedUrl}
            title="Peta lokasi Lembah Kopi"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
