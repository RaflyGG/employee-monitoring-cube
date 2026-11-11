"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { loginAction, registerAction, type AuthState } from "@/actions/auth";
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [loginState, loginFormAction, isLoginPending] = useActionState<
    AuthState,
    FormData
  >(loginAction, {});

  const [registerState, registerFormAction, isRegisterPending] = useActionState<
    AuthState,
    FormData
  >(registerAction, {});

  const activeError =
    mode === "login" ? loginState?.error : registerState?.error;
  const isPending = mode === "login" ? isLoginPending : isRegisterPending;

  return (
    <div className="min-h-screen bg-[#ECEFE5] flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto min-h-screen sm:min-h-0 bg-white sm:rounded-3xl flex flex-col justify-center px-6 py-10 shadow-sm border border-[#060057]/10">
        {/* CUBE Studio Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="mb-3">
            <Image
              src="/cube-logo.png"
              alt="Cube Studio Logo"
              width={196}
              height={138}
              className="object-contain"
              unoptimized
              priority
            />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-[#D74D0D] mt-0.5">
            Employee Monitoring
          </span>
          <p className="text-xs text-[#060057]/60 mt-1">
            Presensi akurat, transparan & anti-kecurangan
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex bg-[#F6F8F1] p-1 rounded-xl mb-6 border border-[#060057]/10">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-[#060057] shadow-xs"
                : "text-[#060057]/50 hover:text-[#060057]"
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "register"
                ? "bg-white text-[#D74D0D] shadow-xs"
                : "text-[#060057]/50 hover:text-[#060057]"
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-5 p-3 rounded-xl bg-[#C92121]/10 border border-[#C92121]/30 flex items-start gap-2.5 text-[#C92121] text-xs font-medium">
            <AlertCircle className="h-4 w-4 text-[#C92121] shrink-0 mt-0.5" />
            <span className="leading-tight">{activeError}</span>
          </div>
        )}

        {/* Success Alert */}
        {registerState?.success && registerState?.message && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex flex-col gap-2 text-emerald-900 text-xs">
            <span className="font-semibold">{registerState.message}</span>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="self-start text-[11px] font-bold text-emerald-800 underline"
            >
              Klik di sini untuk Masuk &rarr;
            </button>
          </div>
        )}

        {/* Form Container */}
        {mode === "login" ? (
          <form action={loginFormAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-bold text-[#060057]"
              >
                Email Perusahaan
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="nama@perusahaan.com"
                autoComplete="email"
                className="w-full text-sm h-12 px-3.5 border border-[#060057]/15 rounded-xl bg-[#F6F8F1]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/20 focus:border-[#D74D0D] text-[#060057] placeholder:text-[#060057]/35 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-bold text-[#060057]"
              >
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  className="w-full text-sm h-12 px-3.5 pr-11 border border-[#060057]/15 rounded-xl bg-[#F6F8F1]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/20 focus:border-[#D74D0D] text-[#060057] placeholder:text-[#060057]/35 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#060057]/40 hover:text-[#060057]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full h-13 min-h-[52px] bg-[#060057] hover:bg-[#04003d] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-[#060057]/20 transition-all"
            >
              {isPending ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Masuk ke Akun</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form action={registerFormAction} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="reg-fullname"
                className="text-xs font-bold text-[#060057]"
              >
                Nama Lengkap
              </label>
              <input
                id="reg-fullname"
                name="full_name"
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                className="w-full text-sm h-11 px-3.5 border border-[#060057]/15 rounded-xl bg-[#F6F8F1]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/20 focus:border-[#D74D0D] text-[#060057] placeholder:text-[#060057]/35 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="reg-empid"
                className="text-xs font-bold text-[#060057]"
              >
                ID Pegawai (NIK / NIP)
              </label>
              <input
                id="reg-empid"
                name="employee_id"
                type="text"
                required
                placeholder="Contoh: EMP-001"
                className="w-full text-sm h-11 px-3.5 border border-[#060057]/15 rounded-xl bg-[#F6F8F1]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/20 focus:border-[#D74D0D] text-[#060057] placeholder:text-[#060057]/35 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="reg-email"
                className="text-xs font-bold text-[#060057]"
              >
                Email Perusahaan
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                placeholder="nama@perusahaan.com"
                className="w-full text-sm h-11 px-3.5 border border-[#060057]/15 rounded-xl bg-[#F6F8F1]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/20 focus:border-[#D74D0D] text-[#060057] placeholder:text-[#060057]/35 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="reg-password"
                className="text-xs font-bold text-[#060057]"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="w-full text-sm h-11 px-3.5 pr-11 border border-[#060057]/15 rounded-xl bg-[#F6F8F1]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/20 focus:border-[#D74D0D] text-[#060057] placeholder:text-[#060057]/35 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#060057]/40 hover:text-[#060057]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full h-13 min-h-[52px] bg-[#D74D0D] hover:bg-[#b83e08] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-[#D74D0D]/20 transition-all"
            >
              {isPending ? (
                <span>Mendaftarkan Akun...</span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Daftar Akun Pegawai</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-[11px] text-[#060057]/45 font-medium">
            CUBE Ecosystem &bull; Internal Company Only
          </p>
        </div>
      </div>
    </div>
  );
}
