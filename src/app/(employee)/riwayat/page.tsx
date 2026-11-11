"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  History,
  Timer,
  Building,
} from "lucide-react";
import { getAttendanceHistory } from "@/actions/attendance";
import type { Attendance } from "@/types/database";

export default function RiwayatPage() {
  const [history, setHistory] = useState<Attendance[]>([]);
  const [stats, setStats] = useState({
    totalDays: 0,
    onTimeCount: 0,
    lateCount: 0,
    totalHoursMinutes: "0j 0m",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<"all" | "this_month">("all");

  const loadHistory = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await getAttendanceHistory();
      setHistory(data.history);
      setStats(data.stats);
    } catch (err) {
      console.error("Gagal memuat riwayat:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Format Date in Indonesian locale
  const formatDateIndo = (dateStr: string) => {
    try {
      // dateStr is 'YYYY-MM-DD'
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Format Time (HH:mm WIB)
  const formatTimeStr = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      return `${date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })} WIB`;
    } catch {
      return "-";
    }
  };

  // Calculate work duration
  const getDuration = (clockIn?: string | null, clockOut?: string | null) => {
    if (!clockIn || !clockOut) return "Sedang Berlangsung";
    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    const diffMs = Math.max(0, end - start);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}j ${minutes}m`;
  };

  // Filtered history list
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const filteredHistory =
    filterMode === "this_month"
      ? history.filter((item) => item.date.startsWith(currentMonthPrefix))
      : history;

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Riwayat Presensi
          </h1>
          <p className="text-xs text-slate-500">
            Rekap catatan kehadiran personal Anda
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadHistory(true)}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh Data"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
          />
        </button>
      </div>

      {/* Mini Stats Summary */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-3">
          Ringkasan Kehadiran
        </span>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col items-center">
            <span className="text-base font-bold text-slate-900">
              {stats.totalDays}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              Total Hadir
            </span>
          </div>

          <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-100 flex flex-col items-center">
            <span className="text-base font-bold text-emerald-700">
              {stats.onTimeCount}
            </span>
            <span className="text-[10px] text-emerald-700/80 font-medium mt-0.5">
              Tepat Waktu
            </span>
          </div>

          <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-100 flex flex-col items-center">
            <span className="text-base font-bold text-amber-700">
              {stats.lateCount}
            </span>
            <span className="text-[10px] text-amber-700/80 font-medium mt-0.5">
              Terlambat
            </span>
          </div>

          <div className="bg-blue-50/60 rounded-xl p-2.5 border border-blue-100 flex flex-col items-center">
            <span className="text-xs font-bold text-blue-700 font-mono mt-1">
              {stats.totalHoursMinutes}
            </span>
            <span className="text-[10px] text-blue-700/80 font-medium mt-0.5">
              Jam Kerja
            </span>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setFilterMode("all")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filterMode === "all"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Semua Data ({history.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterMode("this_month")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filterMode === "this_month"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Bulan Ini
        </button>
      </div>

      {/* List Container */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-xs">
          <RefreshCw className="h-5 w-5 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">
            Memuat riwayat kehadiran...
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-xs flex flex-col items-center">
          <History className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            Belum Ada Riwayat
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
            Catatan kehadiran akan muncul otomatis setelah Anda melakukan
            Clock-In.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredHistory.map((item) => {
            const isCompleted = !!item.clock_out;
            const isOnTime = item.status === "ONTIME";

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-2.5 transition-shadow hover:shadow-sm"
              >
                {/* Date & Badges Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-800">
                      {formatDateIndo(item.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOnTime
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                          : "bg-amber-50 text-amber-700 border border-amber-200/70"
                      }`}
                    >
                      {isOnTime ? "Tepat Waktu" : "Terlambat"}
                    </span>

                    {/* Out of Area Warning Badge */}
                    {item.is_out_of_area && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 inline-flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Luar Radius
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Jam Masuk
                    </span>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">
                      {formatTimeStr(item.clock_in)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Jam Pulang
                    </span>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">
                      {isCompleted
                        ? formatTimeStr(item.clock_out)
                        : "Belum Pulang"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Durasi
                    </span>
                    <span
                      className={`font-bold font-mono text-[11px] ${
                        isCompleted ? "text-blue-600" : "text-amber-600"
                      }`}
                    >
                      {getDuration(item.clock_in, item.clock_out)}
                    </span>
                  </div>
                </div>

                {/* Remarks/Notes if any */}
                {item.notes && (
                  <div className="text-[11px] text-slate-500 bg-slate-50/60 px-2.5 py-1.5 rounded-lg border border-slate-100/80">
                    <span className="font-semibold text-slate-600">
                      Catatan:{" "}
                    </span>
                    {item.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
