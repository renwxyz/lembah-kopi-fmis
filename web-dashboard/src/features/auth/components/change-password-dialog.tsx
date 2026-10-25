"use client";

import { useState } from "react";
import { KeyRound, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-error";
import { useChangePassword } from "../hooks/use-change-password";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordDialog({
  isOpen,
  onClose,
}: ChangePasswordDialogProps) {
  const changePasswordMutation = useChangePassword();

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPasswordBaru, setKonfirmasiPasswordBaru] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwordBaru.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (passwordBaru !== konfirmasiPasswordBaru) {
      setError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        password_lama: passwordLama,
        password_baru: passwordBaru,
        konfirmasi_password_baru: konfirmasiPasswordBaru,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPasswordLama("");
        setPasswordBaru("");
        setKonfirmasiPasswordBaru("");
        onClose();
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memperbarui kata sandi.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F4F0EC] pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#8A7669]" />
            <h3 className="font-heading text-sm font-bold text-[#2A1810]">
              Ubah Kata Sandi Admin
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#8A7669] hover:bg-[#FAF8F5] hover:text-[#2A1810]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 animate-in zoom-in" />
            <p className="font-heading text-sm font-bold text-[#2A1810]">
              Kata Sandi Berhasil Diperbarui!
            </p>
            <p className="text-xs text-[#8A7669]">
              Gunakan kata sandi baru saat login sesi berikutnya.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Kata Sandi Saat Ini
              </label>
              <Input
                type="password"
                required
                value={passwordLama}
                onChange={(e) => setPasswordLama(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                className="rounded-xl border-[#E8E2DC] text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Kata Sandi Baru
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="rounded-xl border-[#E8E2DC] text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7669]">
                Konfirmasi Kata Sandi Baru
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={konfirmasiPasswordBaru}
                onChange={(e) => setKonfirmasiPasswordBaru(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="rounded-xl border-[#E8E2DC] text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F4F0EC]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-[#E8E2DC] px-4 py-2 text-xs font-semibold text-[#6E5D53]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="rounded-xl bg-[#2A1810] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D251A]"
              >
                {changePasswordMutation.isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </div>
                ) : (
                  <span>Perbarui Sandi</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

