import { ArrowRight, Coffee } from "lucide-react";
import type { CoffeeProduct } from "@/types";
import { formatWhatsAppUrl } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";

interface ProductsSectionProps {
  products: CoffeeProduct[];
  nomorWhatsApp?: string;
}

// Badge status: warna tint + teks gelap, selalu disertai teks (DESIGN.md 3.1)
const STATUS_STYLE: Record<CoffeeProduct["status_ketersediaan"], string> = {
  TERSEDIA: "bg-success-tint text-success-ink",
  TERBATAS: "bg-warning-tint text-warning-ink",
  HABIS: "bg-danger-tint text-danger-ink",
};

export function ProductsSection({
  products,
  nomorWhatsApp,
}: ProductsSectionProps) {
  return (
    <section id="katalog" className="section-y bg-surface">
      <div className="container-lk">
        <div data-reveal>
          <SectionHeading
            eyebrow="Katalog Biji Kopi Unggulan"
            title="Karakter Rasa Khas Tanah Glodogan"
            subtitle="Setiap varietas dipanen petik merah dan diolah dengan dedikasi tinggi oleh petani lokal kami."
          />
        </div>

        {products.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-cream-50 p-12 text-center">
            <Coffee
              className="mx-auto mb-3 h-10 w-10 stroke-[1.5] text-text-muted"
              aria-hidden="true"
            />
            <p className="text-base font-medium text-text-muted">
              Katalog produk sedang dalam pembaruan oleh pengurus.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((item) => {
              const proses = item.proses.replace("_", " ");
              const inquiryMsg = `Halo Pengurus Lembah Kopi, saya tertarik dan ingin bertanya mengenai ketersediaan varietas: ${item.nama} (${item.varietas} - ${proses})`;
              const waLink = formatWhatsAppUrl(nomorWhatsApp, inquiryMsg);

              const body = (
                <>
                  <div className="card-zoom absolute inset-0 overflow-hidden">
                    {item.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.foto_url}
                        alt={`${item.nama}, kopi ${item.varietas.toLowerCase()} proses ${proses.toLowerCase()}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-coffee-800 text-sage-300">
                        <Coffee className="h-14 w-14 stroke-[1.25]" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {/* Gradasi gelap di bagian bawah agar teks putih terbaca (kontras >= 4,5) */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-coffee-900 via-coffee-900/55 to-transparent to-65%"
                  />

                  <span
                    className={`absolute right-4 top-4 inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${STATUS_STYLE[item.status_ketersediaan]}`}
                  >
                    {item.status_ketersediaan}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-5 text-surface">
                    <h3 className="font-heading text-xl font-bold leading-snug">
                      {item.nama}
                    </h3>
                    <p className="mt-1 text-sm text-surface/90">
                      <span className="font-semibold uppercase tracking-wider">
                        {item.varietas}
                      </span>
                      <span aria-hidden="true"> • </span>
                      <span>{proses}</span>
                    </p>
                    {waLink ? (
                      <span className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-sage-300">
                        Tanya Ketersediaan (WA)
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : (
                      <p className="mt-3 text-[13px] text-surface/80">
                        Hubungi sekretariat untuk pemesanan
                      </p>
                    )}
                  </div>
                </>
              );

              const cardClass =
                "card-lift card-zoom relative block aspect-[4/5] overflow-hidden rounded-card border border-border bg-coffee-800";

              return (
                <li key={item.id_produk} data-reveal>
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className={`${cardClass} on-dark`}
                    >
                      {body}
                    </a>
                  ) : (
                    <div className={cardClass}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
