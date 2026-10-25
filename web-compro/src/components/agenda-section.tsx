import { Calendar, Clock } from "lucide-react";
import type { Agenda } from "@/types";

interface AgendaSectionProps {
  agenda: Agenda[];
}

export function AgendaSection({ agenda }: AgendaSectionProps) {
  if (agenda.length === 0) return null;

  return (
    <section id="agenda" className="py-20 bg-white border-y border-[#E8E2DC]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9E8E82]">
            Kegiatan Terdekat
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#2A1810] mt-1.5">
            Agenda & Jadwal Petani
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#2A1810]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {agenda.map((item) => {
            const dateObj = new Date(item.tanggal);
            const formattedDate = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <div
                key={item.id_agenda}
                className="flex flex-col justify-between rounded-2xl border border-[#E8E2DC] bg-[#FAF8F5] p-6 shadow-xs hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C28E58] mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{formattedDate}</span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#2A1810] mb-2">
                    {item.judul}
                  </h3>

                  <p className="text-xs text-[#6E5D53] leading-relaxed">
                    {item.keterangan || "Kegiatan rutin kelompok tani Desa Glodogan."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E2DC]/60 flex items-center gap-1.5 text-[11px] font-medium text-[#8A7669]">
                  <Clock className="h-3 w-3" />
                  <span>Agenda Mendatang</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

