"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, CheckSquare, Users, History } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Clock;
}

const navItems: NavItem[] = [
  { label: "Absen", href: "/", icon: Clock },
  { label: "Aktivitas", href: "/aktivitas", icon: CheckSquare },
  { label: "Tim", href: "/tim", icon: Users },
  { label: "Riwayat", href: "/riwayat", icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-[#141926]/95 backdrop-blur-md border-t border-[#060057]/10 dark:border-white/10 px-6 pt-2 z-40 shadow-xs transition-colors duration-150"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
      }}
    >
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
              prefetch={true}
              scroll={false}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] py-1 transition-all active:scale-95 ${
                isActive
                  ? "text-[#D74D0D] dark:text-[#FF6B2B] font-bold"
                  : "text-[#060057]/45 dark:text-[#F6F8F1]/45 hover:text-[#060057]/80 dark:hover:text-[#F6F8F1]/80 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive
                      ? "text-[#D74D0D] dark:text-[#FF6B2B] stroke-[2.3] scale-105"
                      : "stroke-[1.75]"
                  }`}
                />
                {isActive && (
                  <span className="absolute -top-0.5 -right-1.5 h-1.5 w-1.5 rounded-full bg-[#E9B501] dark:bg-[#FCD34D]" />
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
