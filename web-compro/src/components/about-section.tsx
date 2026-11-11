import { ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";
import type { SiteSettings } from "@/types";
import { SectionHeading } from "@/components/section-heading";

interface AboutSectionProps {
  settings: SiteSettings;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const icons = [Sparkles, ShieldCheck, HeartHandshake];

  return (
    <section id="about" className="section-y bg-cream-50">
      <div className="container-lk">
        <div data-reveal>
          <SectionHeading
            eyebrow="Profil & Nilai Komunitas"
            title="Mengenal Lebih Dekat Petani Glodogan"
          />
        </div>

        {/* Cerita narasi */}
        <p
          data-reveal
          className="mx-auto mb-16 max-w-3xl whitespace-pre-line text-center text-base leading-relaxed text-text-muted"
        >
          {settings.about_cerita ||
            "Kelompok Tani Lembah Kopi di Desa Glodogan didirikan sebagai wadah sinergi dan kolaborasi bagi para petani kopi lokal untuk meningkatkan kualitas budidaya, standardisasi pemetikan buah ceri merah, dan menjaga keasrian tanah pertanian secara berkelanjutan.\n\nDengan komitmen bersama, kami terus belajar dan mengadopsi teknik pascapanen modern demi menghadirkan cita rasa kopi terbaik langsung dari petani ke cangkir Anda."}
        </p>

        {/* Butir nilai komunitas: ikon lingkaran + judul + deskripsi, 3 kolom */}
        <ul className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
          {settings.about_nilai?.map((val, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <li key={idx} data-reveal>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-surface">
                  <Icon className="h-6 w-6 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-heading text-xl font-bold text-coffee-900">
                  {val.judul || `Pilar Unggulan #${idx + 1}`}
                </h3>
                <p className="text-base leading-relaxed text-text-muted">
                  {val.deskripsi ||
                    "Dedikasi tanpa henti untuk menjaga integritas proses dan kualitas kopi Glodogan."}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
