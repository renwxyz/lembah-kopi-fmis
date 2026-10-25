import type { PublicHomeData } from "@/types";

const API_BASE_URL =
  process.env.CORE_SYSTEM_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api/v1";

export async function getPublicHomeData(): Promise<PublicHomeData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/home`, {
      next: { revalidate: 60 }, // ISR: Cache 60 detik
    });

    if (!res.ok) {
      console.error(`Gagal memuat data public home: status ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.data as PublicHomeData;
  } catch (error) {
    console.error("Koneksi API public home gagal:", error);
    return null;
  }
}

