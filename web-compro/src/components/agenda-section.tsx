import { Clock } from "lucide-react";
import type { Agenda } from "@/types";
import { SectionHeading } from "@/components/section-heading";

interface AgendaSectionProps {
  agenda: Agenda[];
}

export function AgendaSection({ agenda }: AgendaSectionProps) {
  if (agenda.length === 0) return null;

  return (
    <section id="agenda" className="section-y bg-surface">
      <div className="container-lk">
        <div data-reveal>
          <SectionHeading
            eyebrow="Kegiatan Terdekat"
            title="Agenda & Jadwal Petani"
          />
        </div>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agenda.map((item) => {
            const dateObj = new Date(item.tanggal);
            const hari = dateObj.toLocaleDateString("id-ID", { day: "numeric" });
            const bulan = dateObj.toLocaleDateString("id-ID", { month: "short" });
            const tahun = dateObj.toLocaleDateString("id-ID", { year: "numeric" });
            const tanggalLengkap = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <li
                key={item.id_agenda}
                data-reveal
                className="card-lift flex gap-5 rounded-card border border-border bg-surface p-5"
              >
                {/* Blok tanggal yang menonjol di sisi kiri */}
                <time
                  dateTime={item.tanggal}
                  aria-label={tanggalLengkap}
                  className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-[20px] bg-primary-tint text-primary"
                >
                  <span className="text-[28px] font-bold leading-none">{hari}</span>
                  <span className="mt-1 text-[13px] font-semibold uppercase tracking-wider">
                    {bulan}
                  </span>
                  <span className="text-[11px] font-medium leading-none opacity-80">
                    {tahun}
                  </span>
                </time>

                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="font-heading text-xl font-bold leading-snug text-coffee-900">
                    {item.judul}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-base text-text-muted">
                    {item.keterangan ||
                      "Kegiatan rutin kelompok tani Desa Glodogan."}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 self-start pt-3 text-sm font-medium text-text-muted">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Agenda Mendatang
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
