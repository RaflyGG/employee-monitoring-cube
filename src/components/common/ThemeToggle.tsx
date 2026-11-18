"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
      setMounted(true);
    });
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("cube-theme", nextTheme);
    } catch {
      // localStorage may fail in private mode
    }

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    // Avoid hydration mismatch by rendering placeholder with matching dimensions
    return (
      <div
        className={`h-9 w-9 rounded-xl border border-transparent ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Aktifkan Mode Terang" : "Aktifkan Mode Malam"}
      title={isDark ? "Mode Terang" : "Mode Malam"}
      className={`h-9 px-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 group ${
        isDark
          ? "border-white/10 bg-[#1B2234] text-[#FCD34D] hover:bg-[#232B42] hover:border-white/20"
          : "border-[#060057]/15 bg-white text-[#060057]/70 hover:text-[#060057] hover:bg-[#F6F8F1] hover:border-[#060057]/30"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 shrink-0 transition-transform group-hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-bold tracking-tight">
          {isDark ? "Mode Malam" : "Mode Terang"}
        </span>
      )}
    </button>
  );
}
