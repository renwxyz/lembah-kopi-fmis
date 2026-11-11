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

  const handleClose = () => {
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPasswordBaru("");
    setError("");
    setIsSuccess(false);
    onClose();
  };

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
        handleClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-text-muted" />
            <h3 className="font-heading text-sm font-bold text-coffee-900">
              Ubah Kata Sandi Admin
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-text-muted hover:bg-cream-50 hover:text-coffee-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success animate-in zoom-in" />
            <p className="font-heading text-sm font-bold text-coffee-900">
              Kata Sandi Berhasil Diperbarui!
            </p>
            <p className="text-xs text-text-muted">
              Gunakan kata sandi baru saat login sesi berikutnya.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="rounded-xl bg-danger-tint p-2.5 text-xs text-danger-ink">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Kata Sandi Saat Ini
              </label>
              <Input
                type="password"
                required
                value={passwordLama}
                onChange={(e) => setPasswordLama(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                className="rounded-xl border-border text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Kata Sandi Baru
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="rounded-xl border-border text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Konfirmasi Kata Sandi Baru
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={konfirmasiPasswordBaru}
                onChange={(e) => setKonfirmasiPasswordBaru(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="rounded-xl border-border text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-xl border-border px-4 py-2 text-xs font-semibold text-text-muted"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover min-h-10"
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

