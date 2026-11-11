"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Loader2, X } from "lucide-react";
import { useUploadCmsImage } from "../hooks";

interface ImageUploadFieldProps {
  label: string;
  folder: "hero" | "produk" | "galeri";
  currentKey?: string;
  currentUrl?: string;
  onSuccess: (key: string, url: string) => void;
  onRemove?: () => void;
  required?: boolean;
}

export function ImageUploadField({
  label,
  folder,
  currentKey,
  currentUrl,
  onSuccess,
  onRemove,
  required = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const previewUrl = uploadedPreviewUrl ?? (currentUrl || null);

  const uploadMutation = useUploadCmsImage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Validasi tipe file
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setErrorMsg("Format harus berupa foto JPG atau PNG");
      return;
    }

    // Validasi ukuran maks 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Ukuran foto maksimal 10 MB");
      return;
    }

    uploadMutation.mutate(
      { folder, file },
      {
        onSuccess: (data) => {
          setUploadedPreviewUrl(data.url);
          onSuccess(data.key, data.url);
        },
        onError: (err: unknown) => {
          setErrorMsg(err instanceof Error ? err.message : "Gagal mengunggah foto");
        },
      }
    );
  };

  const handleClear = () => {
    setUploadedPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onRemove) onRemove();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-coffee-900">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        {currentKey && (
          <span className="text-[10px] text-text-muted font-mono truncate max-w-[150px]">
            {currentKey}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {previewUrl ? (
          <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-border bg-cream-50 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {onRemove && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-1 right-1 bg-danger text-white p-1 rounded-full shadow hover:bg-danger transition"
                title="Hapus foto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border bg-cream-50 flex flex-col items-center justify-center text-text-muted shrink-0">
            <ImageIcon className="w-8 h-8 stroke-[1.5] mb-1 text-text-muted" />
            <span className="text-[10px]">Belum ada foto</span>
          </div>
        )}

        <div className="flex-1 space-y-2 w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          <button
            type="button"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-semibold text-coffee-900 hover:bg-primary-tint transition shadow-xs disabled:opacity-50"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-coffee-900" />
                <span>Mengompres & Mengunggah...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-text-muted" />
                <span>Pilih Foto atau Buka Kamera</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-text-muted">
            Maks. 10 MB (JPG/PNG). Foto otomatis dikompres ke format WebP berkualitas tinggi di server.
          </p>

          {errorMsg && (
            <p className="text-[11px] font-medium text-danger">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
