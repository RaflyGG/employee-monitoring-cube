"use client";

import { LogOut, Building2 } from "lucide-react";

interface HeaderProps {
  companyName?: string;
  userName?: string;
  onLogout?: () => void;
}

export function Header({
  companyName = "CUBE Technologies",
  userName = "Alex Pratama",
  onLogout,
}: HeaderProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default handler: clear session or redirect to auth
      console.log("Logout triggered");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              {companyName}
            </span>
            <span className="text-sm font-semibold text-slate-800 leading-tight">
              Halo, {userName}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

