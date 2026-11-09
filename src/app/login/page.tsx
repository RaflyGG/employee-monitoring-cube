"use client";

import { useState, useActionState } from "react";
import { loginAction, registerAction, type AuthState } from "@/actions/auth";
import { Building2, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto min-h-screen sm:min-h-0 bg-slate-50 flex flex-col justify-center px-6 py-10 shadow-sm border-x border-slate-200/70">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-3.5">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Employee Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Presensi akurat, transparan & anti-kecurangan
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
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
                className="text-xs font-semibold text-slate-700"
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
                className="w-full text-sm h-12 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-semibold text-slate-700"
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
                  className="w-full text-sm h-12 px-3.5 pr-11 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              className="mt-2 w-full h-13 min-h-[52px] bg-slate-900 hover:bg-black active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
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
                className="text-xs font-semibold text-slate-700"
              >
                Nama Lengkap
              </label>
              <input
                id="reg-fullname"
                name="full_name"
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                className="w-full text-sm h-11 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="reg-empid"
                className="text-xs font-semibold text-slate-700"
              >
                ID Pegawai (NIK / NIP)
              </label>
              <input
                id="reg-empid"
                name="employee_id"
                type="text"
                required
                placeholder="Contoh: EMP-001"
                className="w-full text-sm h-11 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="reg-email"
                className="text-xs font-semibold text-slate-700"
              >
                Email
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                placeholder="nama@perusahaan.com"
                className="w-full text-sm h-11 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="reg-password"
                className="text-xs font-semibold text-slate-700"
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
                  className="w-full text-sm h-11 px-3.5 pr-11 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              className="mt-2 w-full h-13 min-h-[52px] bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
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
          <p className="text-[11px] text-slate-400">
            Sistem Presensi & Monitoring Karyawan &bull; Internal Company Only
          </p>
        </div>
      </div>
    </div>
  );
}

