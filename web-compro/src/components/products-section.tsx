import { Coffee, MessageCircle } from "lucide-react";
import type { CoffeeProduct } from "@/types";
import { formatWhatsAppUrl } from "@/lib/utils";

interface ProductsSectionProps {
  products: CoffeeProduct[];
  nomorWhatsApp?: string;
}

export function ProductsSection({
  products,
  nomorWhatsApp,
}: ProductsSectionProps) {
  return (
    <section id="katalog" className="py-20 bg-white border-y border-[#E8E2DC]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9E8E82]">
            Katalog Biji Kopi Unggulan
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#2A1810] mt-1.5">
            Karakter Rasa Khas Tanah Glodogan
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#8A7669]">
            Setiap varietas dipanen petik merah dan diolah dengan dedikasi tinggi oleh petani lokal kami.
          </p>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#2A1810]" />
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D6CEC7] bg-[#FAF8F5] p-12 text-center">
            <Coffee className="mx-auto h-10 w-10 text-[#9E8E82] mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-[#8A7669]">
              Katalog produk sedang dalam pembaruan oleh pengurus.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => {
              const inquiryMsg = `Halo Pengurus Lembah Kopi, saya tertarik dan ingin bertanya mengenai ketersediaan varietas: ${item.nama} (${item.varietas} - ${item.proses.replace("_", " ")})`;
              const waLink = formatWhatsAppUrl(nomorWhatsApp, inquiryMsg);

              return (
                <div
                  key={item.id_produk}
                  className="flex flex-col rounded-3xl border border-[#E8E2DC] bg-[#FAF8F5] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-56 w-full bg-[#F0EBE6]">
                    {item.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.foto_url}
                        alt={item.nama}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#9E8E82]">
                        <Coffee className="h-12 w-12 stroke-[1.25]" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                          item.status_ketersediaan === "TERSEDIA"
                            ? "bg-emerald-500 text-white"
                            : item.status_ketersediaan === "TERBATAS"
                            ? "bg-amber-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.status_ketersediaan}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#8A7669] mb-1.5">
                        <span className="text-[#C28E58] uppercase tracking-wider font-bold text-[10px]">
                          {item.varietas}
                        </span>
                        <span>•</span>
                        <span>{item.proses.replace("_", " ")}</span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-[#2A1810]">
                        {item.nama}
                      </h3>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E8E2DC]">
                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl bg-[#2A1810] py-2.5 text-xs font-bold text-white hover:bg-[#3D2317] transition shadow-xs"
                        >
                          <MessageCircle className="h-4 w-4 text-emerald-400" />
                          <span>Tanya Ketersediaan (WA)</span>
                        </a>
                      ) : (
                        <div className="text-center text-[11px] text-[#8A7669]">
                          Hubungi sekretariat untuk pemesanan
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

