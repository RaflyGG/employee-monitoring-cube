"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Loader2, Shield } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/common/ThemeToggle";

interface HeaderProps {
  companyName?: string;
  userName?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export function Header({
  companyName = "CUBE",
  userName = "Pegawai",
  isAdmin = false,
  onLogout,
}: HeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <header
      className="sticky top-0 z-30 bg-white/95 dark:bg-[#141926]/95 backdrop-blur-md border-b border-[#060057]/10 dark:border-white/10 px-4 py-2.5 transition-colors duration-150"
      style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top, 0.625rem))" }}
    >
      <div className="flex items-center justify-between">
        {/* Brand & User Greeting */}
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
            <Image
              src="/cube-icon.png"
              alt="CUBE Logo"
              width={36}
              height={36}
              className="object-contain"
              unoptimized
              priority
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-extrabold tracking-wider text-[#060057] dark:text-[#F6F8F1] font-mono">
                {companyName}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#D74D0D] dark:bg-[#FF6B2B]" />
            </div>
            <span className="text-xs font-semibold text-[#060057]/70 dark:text-[#F6F8F1]/70 leading-tight">
              Halo, <span className="text-[#060057] dark:text-[#F6F8F1] font-bold">{userName}</span>
            </span>
          </div>
        </div>

        {/* Actions: Theme Toggle, Admin Shortcut & Logout */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {isAdmin && (
            <Link
              href="/admin"
              className="h-9 px-2.5 rounded-xl bg-[#060057] dark:bg-[#1B2234] border border-transparent dark:border-white/10 text-white dark:text-[#F6F8F1] text-[11px] font-bold flex items-center gap-1.5 hover:bg-[#060057]/90 dark:hover:bg-[#232B42] transition-colors shadow-xs"
            >
              <Shield className="h-3.5 w-3.5 text-[#E9B501] dark:text-[#FCD34D]" />
              <span>Admin</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            aria-label="Logout"
            className="h-9 w-9 rounded-xl border border-[#060057]/15 dark:border-white/10 flex items-center justify-center text-[#060057]/60 dark:text-[#F6F8F1]/70 hover:text-[#C92121] dark:hover:text-[#EF4444] hover:bg-[#C92121]/5 dark:hover:bg-[#EF4444]/10 hover:border-[#C92121]/30 dark:hover:border-[#EF4444]/30 disabled:opacity-50 transition-colors"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#060057] dark:text-[#F6F8F1]" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
