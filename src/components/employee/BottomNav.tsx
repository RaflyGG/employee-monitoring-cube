"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, CheckSquare, History } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Clock;
}

const navItems: NavItem[] = [
  { label: "Absen", href: "/", icon: Clock },
  { label: "Aktivitas", href: "/aktivitas", icon: CheckSquare },
  { label: "Riwayat", href: "/riwayat", icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-[#060057]/10 px-6 py-2 z-40 shadow-xs">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] py-1 transition-all ${
                isActive
                  ? "text-[#D74D0D] font-bold"
                  : "text-[#060057]/45 hover:text-[#060057]/80 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive
                      ? "text-[#D74D0D] stroke-[2.3] scale-105"
                      : "stroke-[1.75]"
                  }`}
                />
                {isActive && (
                  <span className="absolute -top-0.5 -right-1.5 h-1.5 w-1.5 rounded-full bg-[#E9B501]" />
                )}
              </div>
              <span className="text-[11px] leading-none tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
