"use client";

import { ReactNode, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  MapPin,
  Smartphone,
  LogOut,
  Loader2,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { RoleBadge } from "@/components/admin/StatusBadges";
import type { UserRole } from "@/types/database";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Monitoring Hari Ini", icon: LayoutDashboard },
  { href: "/admin/riwayat", label: "Rekap & Export", icon: FileSpreadsheet },
  { href: "/admin/pegawai", label: "Data Pegawai", icon: Users },
  { href: "/admin/kantor", label: "Kantor & Geofence", icon: MapPin },
];

interface AdminShellProps {
  userName: string;
  role: UserRole;
  children: ReactNode;
}

export function AdminShell({ userName, role, children }: AdminShellProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8F1] text-[#060057] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-[#060057]/10 z-30">
        <div className="p-5 border-b border-[#060057]/10 flex items-center gap-3">
          <Image
            src="/cube-icon.png"
            alt="CUBE Logo"
            width={36}
            height={36}
            className="object-contain shrink-0"
            unoptimized
            priority
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-black tracking-wider text-[#060057]">
                CUBE ADMIN
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#D74D0D]" />
            </div>
            <span className="text-[11px] font-medium text-[#060057]/60">
              Employee Monitoring
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#060057] text-white shadow-xs"
                    : "text-[#060057]/70 hover:bg-[#F6F8F1] hover:text-[#060057]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-[#E9B501]" : "text-[#060057]/55"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#060057]/10 flex flex-col gap-3">
          <div className="bg-[#F6F8F1] rounded-xl p-3 border border-[#060057]/10">
            <p className="text-xs font-bold text-[#060057] truncate">
              {userName}
            </p>
            <div className="mt-1.5">
              <RoleBadge role={role} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              className="w-full py-2 px-3 rounded-xl border border-[#060057]/15 text-xs font-bold text-[#060057] hover:bg-[#F6F8F1] flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="h-3.5 w-3.5 text-[#D74D0D]" />
              <span>Mode Absen Pegawai</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="w-full py-2 px-3 rounded-xl border border-[#C92121]/20 text-xs font-bold text-[#C92121] hover:bg-[#C92121]/5 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Navigation */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#060057]/10">
        <div className="px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Image
              src="/cube-icon.png"
              alt="CUBE Logo"
              width={32}
              height={32}
              className="object-contain shrink-0"
              unoptimized
              priority
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-black tracking-wider text-[#060057]">
                  CUBE ADMIN
                </span>
                <RoleBadge role={role} />
              </div>
              <p className="text-[11px] font-semibold text-[#060057]/65 truncate max-w-[160px]">
                {userName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              className="h-8 px-2.5 rounded-lg border border-[#060057]/15 text-[11px] font-bold text-[#060057] flex items-center gap-1 hover:bg-[#F6F8F1]"
            >
              <Smartphone className="h-3.5 w-3.5 text-[#D74D0D]" />
              <span>Pegawai</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              aria-label="Logout"
              className="h-8 w-8 rounded-lg border border-[#C92121]/25 flex items-center justify-center text-[#C92121] hover:bg-[#C92121]/5"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <nav className="px-3 pb-2.5 flex items-center gap-1.5 overflow-x-auto">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? "bg-[#060057] text-white"
                    : "bg-[#F6F8F1] text-[#060057]/70 border border-[#060057]/10"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? "text-[#E9B501]" : "text-[#060057]/55"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

