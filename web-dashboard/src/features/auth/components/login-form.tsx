"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, User, Sprout, Eye, EyeOff } from "lucide-react";

import { loginSchema, type LoginSchema } from "@/features/auth/validation";
import { useLogin } from "@/features/auth/hooks/use-login";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginSchema) => {
    setErrorMessage(null);
    loginMutation.mutate(data, {
      onSuccess: () => router.replace("/dashboard"),
      onError: (error) => {
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Gagal masuk. Periksa kembali akun Anda.",
        );
      },
    });
  };

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#FAFAFA]">
      {/* Background Decorator Halus */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232A1810' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />

      {/* Wrapper Utama Responsif */}
      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl items-stretch lg:items-center lg:px-6 lg:py-10">
        
        {/* Card Grid Asimetris[cite: 1] */}
        <div className="grid w-full overflow-hidden bg-white lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr] lg:rounded-3xl lg:border lg:border-[#E8E2DC] lg:shadow-xl lg:shadow-[#2A1810]/5">
          
          {/* Banner Sisi Kiri (Hanya Muncul di Desktop >= lg)[cite: 1] */}
          <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2A1810] via-[#3D2318] to-[#1A0F0A] px-12 py-14 text-white">
            <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full bg-[#B83227]/20 blur-3xl" />
            
            <div className="relative flex items-center gap-3 font-semibold">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <Sprout className="h-6 w-6 text-[#E8E2DC]" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-[#FAF8F5]">
                Lembah Kopi
              </span>
            </div>

            <div className="relative space-y-3">
              <p className="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
                Portal Admin & Pengurus
              </p>
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
                Sistem Perkebunan & Traceability
              </h1>
              <p className="text-sm text-white/75 leading-relaxed max-w-md">
                Kelola data petani, pemetaan lahan, dan rantai pasok kopi dalam satu dasbor operasional terintegrasi.
              </p>
            </div>

            <p className="relative text-sm text-white/50">
              © 2026 Kelompok Tani Lembah Kopi
            </p>
          </aside>

          {/* Form Section (Responsif Penuh di Mobile & Desktop)[cite: 1] */}
          <div className="flex items-center justify-center bg-white/80 p-6 backdrop-blur-sm sm:p-10 lg:p-12">
            <div className="w-full max-w-md space-y-6">
              
              {/* Logo Tambahan Khusus Tampilan Mobile (< lg) */}
              <div className="flex items-center gap-2.5 lg:hidden mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2A1810] text-white">
                  <Sprout className="h-5 w-5 text-[#E8E2DC]" />
                </div>
                <span className="font-heading text-lg font-bold text-[#2A1810]">
                  Lembah Kopi
                </span>
              </div>

              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-[#2A1810] sm:text-3xl">
                  Masuk ke akun
                </h1>
                <p className="mt-2 text-sm text-[#6E5D53]">
                  Gunakan kredensial pengurus yang telah terdaftar.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#2A1810]">
                    Username atau email
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E8E82]" />
                    <Input
                      {...register("username_or_email")}
                      placeholder="Masukkan username atau email"
                      className="w-full rounded-lg border border-[#E8E2DC] bg-white py-3 pr-4 pl-10 text-sm outline-none focus-visible:border-[#2A1810] focus-visible:ring-2 focus-visible:ring-[#2A1810]/20"
                      disabled={loginMutation.isPending}
                    />
                  </div>
                  {errors.username_or_email && (
                    <p className="text-xs font-medium text-red-600 pt-0.5">
                      {errors.username_or_email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#2A1810]">
                    Kata sandi
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E8E82]" />
                    <Input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-[#E8E2DC] bg-white py-3 pr-11 pl-10 text-sm outline-none focus-visible:border-[#2A1810] focus-visible:ring-2 focus-visible:ring-[#2A1810]/20"
                      disabled={loginMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8E82] hover:text-[#2A1810] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-medium text-red-600 pt-0.5">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full h-10 rounded-lg bg-[#2A1810] text-white hover:bg-[#3D2318] font-semibold text-sm shadow-sm transition-all"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>

              {/* Footer info khusus tampilan Mobile */}
              <div className="pt-4 text-center text-xs text-[#9E8E82] lg:hidden">
                © 2026 Kelompok Tani Lembah Kopi
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
