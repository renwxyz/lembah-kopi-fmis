"use client";

import { useState } from "react";
import {
  Calendar,
  Coffee,
  Globe,
  Image as ImageIcon,
  Settings,
  Video,
} from "lucide-react";
import { SettingsForm } from "@/features/cms/components/settings-form";
import { ProductsManager } from "@/features/cms/components/products-manager";
import { MediaManager } from "@/features/cms/components/media-manager";
import { AgendaManager } from "@/features/cms/components/agenda-manager";
import { GalleryManager } from "@/features/cms/components/gallery-manager";

type CmsTab = "settings" | "products" | "media" | "agenda" | "gallery";

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<CmsTab>("settings");

  const tabs = [
    {
      id: "settings" as CmsTab,
      label: "Profil & Hero",
      icon: Settings,
      desc: "Banner, Narasi Desa, & Kontak",
    },
    {
      id: "products" as CmsTab,
      label: "Katalog Kopi",
      icon: Coffee,
      desc: "Varietas & Direct WhatsApp",
    },
    {
      id: "media" as CmsTab,
      label: "Media Embed",
      icon: Video,
      desc: "YouTube & Instagram Post",
    },
    {
      id: "agenda" as CmsTab,
      label: "Agenda",
      icon: Calendar,
      desc: "Jadwal & Pengumuman",
    },
    {
      id: "gallery" as CmsTab,
      label: "Galeri Foto",
      icon: ImageIcon,
      desc: "Dokumentasi Aktivitas Tani",
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white">
              <Globe className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Community Profile & CMS
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-coffee-900 mt-1">
            Manajemen Konten Publik
          </h1>
          <p className="text-xs text-text-muted">
            Kelola profil kelompok tani, showcase produk kopi, agenda, video, dan dokumentasi foto untuk website publik.
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap border-b-2 -mb-[2px] ${
                isActive
                  ? "border-primary bg-surface text-coffee-900 shadow-xs"
                  : "border-transparent text-text-muted hover:bg-cream-50 hover:text-coffee-900"
              }`}
            >
              <tab.icon
                className={`h-4 w-4 ${
                  isActive ? "text-coffee-900" : "text-text-muted"
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div>
        {activeTab === "settings" && <SettingsForm />}
        {activeTab === "products" && <ProductsManager />}
        {activeTab === "media" && <MediaManager />}
        {activeTab === "agenda" && <AgendaManager />}
        {activeTab === "gallery" && <GalleryManager />}
      </div>
    </div>
  );
}
