import { ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";
import type { SiteSettings } from "@/types";

interface AboutSectionProps {
  settings: SiteSettings;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const icons = [Sparkles, ShieldCheck, HeartHandshake];

  return (
    <section id="about" className="py-20 bg-[#FAF8F5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9E8E82]">
            Profil & Nilai Komunitas
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#2A1810] mt-1.5">
            Mengenal Lebih Dekat Petani Glodogan
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#2A1810]" />
        </div>

        {/* Cerita Narasi */}
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#E8E2DC] bg-white p-8 sm:p-10 shadow-xs mb-16 text-center">
          <p className="text-sm sm:text-base leading-relaxed text-[#6E5D53] whitespace-pre-line">
            {settings.about_cerita ||
              "Kelompok Tani Lembah Kopi di Desa Glodogan didirikan sebagai wadah sinergi dan kolaborasi bagi para petani kopi lokal untuk meningkatkan kualitas budidaya, standardisasi pemetikan buah ceri merah, dan menjaga keasrian tanah pertanian secara berkelanjutan.\n\nDengan komitmen bersama, kami terus belajar dan mengadopsi teknik pascapanen modern demi menghadirkan cita rasa kopi terbaik langsung dari petani ke cangkir Anda."}
          </p>
        </div>

        {/* 3 Nilai Komunitas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {settings.about_nilai?.map((val, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center rounded-2xl border border-[#E8E2DC] bg-white p-6 shadow-xs hover:shadow-md transition"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F0EC] text-[#2A1810] mb-4">
                  <Icon className="h-6 w-6 stroke-[1.75]" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#2A1810] mb-2">
                  {val.judul || `Pilar Unggulan #${idx + 1}`}
                </h3>
                <p className="text-xs text-[#6E5D53] leading-relaxed">
                  {val.deskripsi ||
                    "Dedikasi tanpa henti untuk menjaga integritas proses dan kualitas kopi Glodogan."}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

