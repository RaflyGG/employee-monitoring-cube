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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200/80 px-6 py-2.5 z-40">
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
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] py-1 transition-colors ${
                isActive
                  ? "text-slate-900 font-semibold"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-blue-600 stroke-[2.25]" : "stroke-[1.75]"
                }`}
              />
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

