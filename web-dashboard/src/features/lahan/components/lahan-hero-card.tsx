"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Trees,
  Maximize2,
  Mountain,
  User,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { Lahan } from "../types";

interface LahanHeroCardProps {
  lahan: Lahan;
  onEdit: () => void;
}

export function LahanHeroCard({ lahan, onEdit }: LahanHeroCardProps) {
  const areaHa = lahan.luas_m2 ? lahan.luas_m2 / 10000 : null;

  const rawPhone = lahan.petani?.no_hp
    ? lahan.petani.no_hp.replace(/[^0-9]/g, "")
    : "";
  const waPhone = rawPhone.startsWith("0") ? `62${rawPhone.slice(1)}` : rawPhone;

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_4px_20px_-4px_rgba(42,24,16,0.06)]">
      {/* Top Bar: Back Link & Edit Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#F4F0EC] pb-4">
        <Link
          href="/dashboard/lahan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A7669] hover:text-[#2A1810] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Lahan
        </Link>

        <Button
          onClick={onEdit}
          className="h-9 gap-1.5 rounded-lg bg-[#2A1810] px-4 text-xs font-semibold text-white hover:bg-[#3D2317] shadow-sm self-start sm:self-auto"
        >
          <Edit className="h-3.5 w-3.5" />
          Ubah Data & Batas Lahan
        </Button>
      </div>

      {/* Main Info Header */}
      <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[#8A7669] bg-[#FAF8F5] px-2 py-0.5 rounded-md">
              {lahan.id_lahan}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              <MapPin className="h-3 w-3" />
              {lahan.dusun}
            </span>
          </div>

          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-[#2A1810]">
            {lahan.nama_petak}
          </h1>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-[#6E5D53]">
            <span className="flex items-center gap-1 font-medium text-[#2A1810]">
              <User className="h-3.5 w-3.5 text-[#8A7669]" />
              {lahan.petani?.nama_lengkap || "Petani Terdaftar"}
            </span>

            {lahan.petani?.no_hp && (
              <>
                <span>•</span>
                <span>{lahan.petani.no_hp}</span>
                {waPhone && (
                  <a
                    href={`https://wa.me/${waPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Hubungi Petani"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </a>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 bg-[#FCFBF9] p-3.5 rounded-xl border border-black/[0.03]">
          <div>
            <span className="text-[11px] font-semibold text-[#8A7669] uppercase flex items-center gap-1">
              <Maximize2 className="h-3 w-3" /> Luas Lahan
            </span>
            <span className="font-heading text-base font-bold text-[#2A1810] block mt-0.5">
              {lahan.luas_m2 ? `${formatNumber(lahan.luas_m2, 0)} m²` : "—"}
            </span>
            <span className="text-[11px] text-[#6E5D53] block">
              {areaHa ? `(~${formatNumber(areaHa, 2)} ha)` : "Belum diplot"}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#8A7669] uppercase flex items-center gap-1">
              <Mountain className="h-3 w-3" /> Elevasi
            </span>
            <span className="font-heading text-base font-bold text-[#2A1810] block mt-0.5">
              {lahan.elevasi_mdpl ? `${formatNumber(lahan.elevasi_mdpl, 0)}` : "—"}
            </span>
            <span className="text-[11px] text-[#6E5D53] block">mdpl</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#8A7669] uppercase flex items-center gap-1">
              <Trees className="h-3 w-3" /> Total Pohon
            </span>
            <span className="font-heading text-base font-bold text-[#2A1810] block mt-0.5">
              {lahan.total_pohon ? `${formatNumber(lahan.total_pohon, 0)}` : "0"}
            </span>
            <span className="text-[11px] text-[#6E5D53] block">Pohon aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
}

