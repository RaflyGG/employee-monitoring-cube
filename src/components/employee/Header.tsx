"use client";

import { useTransition } from "react";
import Image from "next/image";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/actions/auth";

interface HeaderProps {
  companyName?: string;
  userName?: string;
  onLogout?: () => void;
}

export function Header({
  companyName = "CUBE",
  userName = "Pegawai",
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#060057]/10 px-4 py-2.5">
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
              <span className="text-[12px] font-extrabold tracking-wider text-[#060057] font-mono">
                {companyName}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#D74D0D]" />
            </div>
            <span className="text-xs font-semibold text-[#060057]/70 leading-tight">
              Halo, <span className="text-[#060057] font-bold">{userName}</span>
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          aria-label="Logout"
          className="h-9 w-9 rounded-xl border border-[#060057]/15 flex items-center justify-center text-[#060057]/60 hover:text-[#C92121] hover:bg-[#C92121]/5 hover:border-[#C92121]/30 disabled:opacity-50 transition-colors"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#060057]" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
