"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  AlertTriangle,
  RefreshCw,
  History,
  ChevronDown,
  ChevronUp,
  ListTodo,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const loadHistory = useCallback(async () => {
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

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    void loadHistory();
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadHistory();
    });
  }, [loadHistory]);

  // Format Date in Indonesian locale
  const formatDateIndo = (dateStr: string) => {
    try {
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
          <h1 className="text-base font-extrabold text-[#060057] tracking-tight">
            Riwayat Presensi
          </h1>
          <p className="text-xs text-[#060057]/60">
            Rekap kehadiran & laporan aktivitas harian
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh Data"
          className="p-2 rounded-xl bg-white border border-[#060057]/15 text-[#060057]/70 hover:bg-[#F6F8F1] disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isRefreshing ? "animate-spin text-[#D74D0D]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mini Stats Summary */}
      <section className="bg-white border border-[#060057]/10 rounded-2xl p-4 shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#060057]/45 block mb-3">
          Ringkasan Kehadiran
        </span>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-[#F6F8F1] rounded-xl p-2.5 border border-[#060057]/10 flex flex-col items-center">
            <span className="text-base font-black text-[#060057]">
              {stats.totalDays}
            </span>
            <span className="text-[10px] text-[#060057]/60 font-semibold mt-0.5">
              Total Hadir
            </span>
          </div>

          <div className="bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-200/70 flex flex-col items-center">
            <span className="text-base font-black text-emerald-700">
              {stats.onTimeCount}
            </span>
            <span className="text-[10px] text-emerald-700/80 font-semibold mt-0.5">
              Tepat Waktu
            </span>
          </div>

          <div className="bg-[#E9B501]/15 rounded-xl p-2.5 border border-[#E9B501]/40 flex flex-col items-center">
            <span className="text-base font-black text-[#8f6a00]">
              {stats.lateCount}
            </span>
            <span className="text-[10px] text-[#8f6a00] font-semibold mt-0.5">
              Terlambat
            </span>
          </div>

          <div className="bg-[#D74D0D]/10 rounded-xl p-2.5 border border-[#D74D0D]/25 flex flex-col items-center">
            <span className="text-xs font-black text-[#D74D0D] font-mono mt-1">
              {stats.totalHoursMinutes}
            </span>
            <span className="text-[10px] text-[#D74D0D] font-semibold mt-0.5">
              Jam Kerja
            </span>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-[#060057]/10">
        <button
          type="button"
          onClick={() => setFilterMode("all")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            filterMode === "all"
              ? "bg-[#060057] text-white shadow-xs"
              : "text-[#060057]/55 hover:text-[#060057]"
          }`}
        >
          Semua Data ({history.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterMode("this_month")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            filterMode === "this_month"
              ? "bg-[#060057] text-white shadow-xs"
              : "text-[#060057]/55 hover:text-[#060057]"
          }`}
        >
          Bulan Ini
        </button>
      </div>

      {/* List Container */}
      {isLoading ? (
        <div className="bg-white border border-[#060057]/10 rounded-2xl p-8 text-center shadow-xs">
          <RefreshCw className="h-5 w-5 text-[#D74D0D] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#060057]/60 font-medium">
            Memuat riwayat kehadiran...
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white border border-[#060057]/10 rounded-2xl p-8 text-center shadow-xs flex flex-col items-center">
          <History className="h-8 w-8 text-[#060057]/25 mb-2" />
          <p className="text-sm font-bold text-[#060057]">
            Belum Ada Riwayat
          </p>
          <p className="text-xs text-[#060057]/50 mt-1 max-w-[240px]">
            Catatan kehadiran akan muncul otomatis setelah Anda melakukan
            Clock-In.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredHistory.map((item) => {
            const isCompleted = !!item.clock_out;
            const isOnTime = item.status === "ONTIME";
            const tasks = item.daily_tasks || [];
            const taskCount = tasks.length;
            const completedTasks = tasks.filter(
              (t) => t.status === "COMPLETED"
            ).length;
            const isExpanded = expandedIds.has(item.id);

            return (
              <div
                key={item.id}
                className="bg-white border border-[#060057]/10 rounded-2xl p-4 shadow-xs flex flex-col gap-3 transition-shadow hover:shadow-sm"
              >
                {/* Date & Badges Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#D74D0D]" />
                    <span className="text-xs font-bold text-[#060057]">
                      {formatDateIndo(item.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOnTime
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-[#E9B501]/20 text-[#7d6000] border border-[#E9B501]/50"
                      }`}
                    >
                      {isOnTime ? "Tepat Waktu" : "Terlambat"}
                    </span>

                    {/* Out of Area Warning Badge */}
                    {item.is_out_of_area && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#C92121]/10 text-[#C92121] border border-[#C92121]/25 inline-flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Luar Radius
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F6F8F1] rounded-xl border border-[#060057]/10 text-xs">
                  <div>
                    <span className="text-[10px] text-[#060057]/50 font-semibold block">
                      Jam Masuk
                    </span>
                    <span className="font-extrabold text-[#060057] font-mono text-[11px]">
                      {formatTimeStr(item.clock_in)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#060057]/50 font-semibold block">
                      Jam Pulang
                    </span>
                    <span className="font-extrabold text-[#060057] font-mono text-[11px]">
                      {isCompleted
                        ? formatTimeStr(item.clock_out)
                        : "Belum Pulang"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#060057]/50 font-semibold block">
                      Durasi
                    </span>
                    <span
                      className={`font-extrabold font-mono text-[11px] ${
                        isCompleted ? "text-[#D74D0D]" : "text-[#8f6a00]"
                      }`}
                    >
                      {getDuration(item.clock_in, item.clock_out)}
                    </span>
                  </div>
                </div>

                {/* Remarks/Notes if any */}
                {item.notes && (
                  <div className="text-[11px] text-[#060057]/75 bg-[#F6F8F1]/60 px-2.5 py-1.5 rounded-lg border border-[#060057]/10">
                    <span className="font-bold text-[#060057]">Catatan: </span>
                    {item.notes}
                  </div>
                )}

                {/* Cara B: Expandable Daily Tasks Section */}
                <div className="border-t border-[#060057]/10 pt-2.5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="w-full flex items-center justify-between text-xs py-1 text-[#060057]/80 hover:text-[#060057] transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <ListTodo className="h-3.5 w-3.5 text-[#D74D0D]" />
                      <span className="font-bold text-[11px]">
                        Laporan Tugas ({taskCount})
                      </span>
                      {taskCount > 0 && (
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          &bull; {completedTasks}/{taskCount} Selesai
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#060057]/50 font-semibold">
                      <span>{isExpanded ? "Tutup" : "Lihat"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="mt-2.5 flex flex-col gap-1.5 bg-[#F6F8F1] rounded-xl p-2.5 border border-[#060057]/10">
                      {taskCount === 0 ? (
                        <p className="text-[11px] text-[#060057]/45 text-center py-1">
                          Tidak ada catatan aktivitas di hari ini.
                        </p>
                      ) : (
                        tasks.map((task) => {
                          const isTaskDone = task.status === "COMPLETED";
                          const isTaskBlocked = task.status === "BLOCKED";

                          return (
                            <div
                              key={task.id}
                              className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white border border-[#060057]/10"
                            >
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <span className="mt-0.5 shrink-0">
                                  {isTaskDone ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : isTaskBlocked ? (
                                    <AlertCircle className="h-3.5 w-3.5 text-[#C92121]" />
                                  ) : (
                                    <PlayCircle className="h-3.5 w-3.5 text-[#E9B501]" />
                                  )}
                                </span>
                                <span
                                  className={`text-[11px] leading-tight break-words ${
                                    isTaskDone
                                      ? "line-through text-[#060057]/40"
                                      : "text-[#060057] font-semibold"
                                  }`}
                                >
                                  {task.task_description}
                                </span>
                              </div>

                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                                  isTaskDone
                                    ? "bg-emerald-50 text-emerald-700"
                                    : isTaskBlocked
                                    ? "bg-[#C92121]/10 text-[#C92121]"
                                    : "bg-[#E9B501]/20 text-[#7d6000]"
                                }`}
                              >
                                {isTaskDone
                                  ? "Selesai"
                                  : isTaskBlocked
                                  ? "Terkendala"
                                  : "Proses"}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
