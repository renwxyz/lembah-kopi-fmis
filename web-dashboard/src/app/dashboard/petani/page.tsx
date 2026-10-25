"use client";

import { Users, Phone, MapPin } from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { usePetaniList } from "@/features/petani/hooks/use-petani-list";
import { PetaniTable } from "@/features/petani/components/petani-table";

export default function PetaniPage() {
  const { data } = usePetaniList();
  const farmers = data?.items ?? [];
  const totalPetani = data?.total ?? farmers.length;
  const petaniWithPhone = farmers.filter((f) => Boolean(f.no_hp && f.no_hp.trim())).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight text-[#2A1810]">
          Manajemen Anggota Petani
        </h1>
        <p className="mt-1 text-xs text-[#6E5D53]">
          Pendataan dan pengelolaan profil anggota kelompok tani Desa Glodogan (Sub-Modul PRD M1.1).
        </p>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Anggota Petani"
          value={totalPetani}
          icon={Users}
          description="Terdaftar di database kelompok tani"
        />

        <KpiCard
          title="Kontak Aktif / WhatsApp"
          value={petaniWithPhone}
          icon={Phone}
          description="Memiliki nomor telepon aktif"
        />

        <KpiCard
          title="Wilayah Komunitas"
          value="Glodogan"
          icon={MapPin}
          description="Kabupaten Temanggung, Jawa Tengah"
        />
      </div>

      {/* Main Table */}
      <PetaniTable />
    </div>
  );
}
