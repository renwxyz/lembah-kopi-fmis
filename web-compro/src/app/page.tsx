import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ProductsSection } from "@/components/products-section";
import { MediaSection } from "@/components/media-section";
import { AgendaSection } from "@/components/agenda-section";
import { GallerySection } from "@/components/gallery-section";
import { Footer } from "@/components/footer";
import { getPublicHomeData } from "@/lib/api";

export const revalidate = 60; // ISR revalidasi setiap 60 detik

export default async function HomePage() {
  const data = await getPublicHomeData();

  // Fallback data default apabila database masih kosong atau baru diinisiasi
  const settings = data?.pengaturan || {
    hero_judul: "Kelompok Tani Lembah Kopi",
    hero_slogan: "Cita Rasa Kopi Murni dari Lereng Desa Glodogan",
    nomor_whatsapp: "",
    about_cerita:
      "Kelompok Tani Lembah Kopi di Desa Glodogan didedikasikan untuk membudidayakan kopi berkualitas dengan praktik pertanian ramah lingkungan dan pascapanen yang presisi.",
    about_nilai: [
      {
        judul: "Petik Merah Optimal",
        deskripsi: "Memastikan kematangan biji kopi pada tingkat manis dan aroma terbaik.",
      },
      {
        judul: "Pemberdayaan Warga",
        deskripsi: "Kolaborasi aktif antarpetani lokal untuk kemandirian ekonomi desa.",
      },
      {
        judul: "Konservasi Lahan",
        deskripsi: "Menjaga keseimbangan ekosistem tanah dan resapan air di desa.",
      },
    ],
    alamat: "Desa Glodogan, Klaten, Jawa Tengah",
    instagram_url: "",
    youtube_url: "",
    facebook_url: "",
    tiktok_url: "",
  };

  const products = data?.produk || [];
  const media = data?.media || [];
  const agenda = data?.agenda || [];
  const gallery = data?.galeri || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection settings={settings} />
        <AboutSection settings={settings} />
        <ProductsSection
          products={products}
          nomorWhatsApp={settings.nomor_whatsapp}
        />
        <MediaSection media={media} />
        <AgendaSection agenda={agenda} />
        <GallerySection gallery={gallery} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}

