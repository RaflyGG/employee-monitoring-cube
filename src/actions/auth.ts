"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

export interface AuthState {
  error?: string | null;
  success?: boolean;
  message?: string;
}

function handleAuthErrorMessage(message: string): string {
  if (message.includes("Email not confirmed")) {
    return "Email belum dikonfirmasi. Buka Dashboard Supabase -> Authentication -> Providers -> Email, matikan opsi 'Confirm email'.";
  }
  if (message.includes("Invalid login credentials")) {
    return "Email atau kata sandi salah. Pastikan data yang dimasukkan benar.";
  }
  if (message.includes("User already registered")) {
    return "Email ini sudah terdaftar. Silakan langsung login pada tab Masuk.";
  }
  if (message.includes("fetch failed")) {
    return "Koneksi ke Supabase terputus (fetch failed). Periksa koneksi internet Anda atau coba restart server 'npm run dev'.";
  }
  return message;
}

function isRedirect(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const record = err as { message?: unknown; digest?: unknown };
  return (
    record.message === "NEXT_REDIRECT" ||
    (typeof record.digest === "string" &&
      record.digest.startsWith("NEXT_REDIRECT"))
  );
}

/**
 * Log in with Email and Password
 */
export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  try {
    const supabase = await createClient();

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: handleAuthErrorMessage(error.message) };
    }

    let destination = "/";
    if (signInData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", signInData.user.id)
        .maybeSingle();
      if (profile?.role === "HR_ADMIN" || profile?.role === "SUPERVISOR") {
        destination = "/admin";
      }
    }

    revalidatePath("/", "layout");
    redirect(destination);
  } catch (err: unknown) {
    if (isRedirect(err)) throw err;
    const msg =
      err instanceof Error ? err.message : "Gagal menghubungi server Supabase.";
    return {
      error: handleAuthErrorMessage(msg),
    };
  }
}

/**
 * Register a new employee account
 */
export async function registerAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const employeeId = formData.get("employee_id") as string;

  if (!email || !password || !fullName || !employeeId) {
    return { error: "Semua kolom wajib diisi lengkap." };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          employee_id: employeeId,
        },
      },
    });

    if (error) {
      return { error: handleAuthErrorMessage(error.message) };
    }

    // Jika session langsung aktif
    if (data?.session) {
      revalidatePath("/", "layout");
      redirect("/");
    }

    return {
      success: true,
      message:
        "Pendaftaran berhasil! Akun Anda telah dibuat. Silakan beralih ke tab Masuk untuk login.",
    };
  } catch (err: unknown) {
    if (isRedirect(err)) throw err;
    const msg =
      err instanceof Error ? err.message : "Gagal menghubungi server Supabase.";
    return {
      error: handleAuthErrorMessage(msg),
    };
  }
}

/**
 * Log out current session
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Get current logged in user & profile
 */
export async function getCurrentUser(): Promise<{
  user: User | null;
  profile: Profile | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, profile: null };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { user, profile: profile as Profile | null };
  } catch {
    return { user: null, profile: null };
  }
}
