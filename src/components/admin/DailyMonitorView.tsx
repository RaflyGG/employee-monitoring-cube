"use client";

import { useState, useTransition } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserX,
  Search,
  RefreshCw,
  MapPin,
  ChevronDown,
  ChevronUp,
  ListTodo,
  ExternalLink,
  Calendar,
} from "lucide-react";
import {
  getAdminDailyOverview,
  type AdminDailyOverviewResult,
} from "@/actions/admin";
import {
  AttendanceStatusBadge,
  GeofenceBadge,
  TaskStatusBadge,
} from "@/components/admin/StatusBadges";
import {
  calculateDurationLabel,
  formatDateIndo,
  formatTimeWIB,
} from "@/lib/date";

type FilterKey = "ALL" | "PRESENT" | "ONTIME" | "LATE" | "OUT_OF_AREA" | "ABSENT";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "PRESENT", label: "Sudah Absen" },
  { key: "ONTIME", label: "Tepat Waktu" },
  { key: "LATE", label: "Terlambat" },
  { key: "OUT_OF_AREA", label: "Luar Area" },
  { key: "ABSENT", label: "Belum Absen" },
];

export function DailyMonitorView({
  initialData,
}: {
  initialData: AdminDailyOverviewResult;
}) {
  const [data, setData] = useState<AdminDailyOverviewResult>(initialData);
  const [selectedDate, setSelectedDate] = useState<string>(initialData.date);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [isPending, startTransition] = useTransition();

  const reloadForDate = (targetDate: string) => {
    startTransition(async () => {
      const fresh = await getAdminDailyOverview(targetDate);
      setData(fresh);
    });
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    reloadForDate(newDate);
  };

  const toggleExpand = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredRows = data.rows.filter((row) => {
    const matchesQuery =
      !query ||
      row.profile.full_name.toLowerCase().includes(query) ||
      row.profile.employee_id.toLowerCase().includes(query) ||
      (row.profile.department || "").toLowerCase().includes(query);

    if (!matchesQuery) return false;

    switch (activeFilter) {
      case "PRESENT":
        return Boolean(row.attendance);
      case "ONTIME":
        return row.attendance?.status === "ONTIME";
      case "LATE":
        return row.attendance?.status === "LATE";
      case "OUT_OF_AREA":
        return Boolean(row.attendance?.is_out_of_area);
      case "ABSENT":
        return !row.attendance;
      default:
        return true;
    }
  });

  const kpiCards = [
    {
      label: "Pegawai Aktif",
      value: data.summary.totalActiveEmployees,
      icon: Users,
      accent: "text-[#060057]",
      bg: "bg-white",
    },
    {
      label: "Sudah Absen",
      value: data.summary.presentCount,
      icon: CheckCircle2,
      accent: "text-emerald-600",
      bg: "bg-white",
    },
    {
      label: "Terlambat",
      value: data.summary.lateCount,
      icon: Clock,
      accent: "text-[#D74D0D]",
      bg: "bg-white",
    },
    {
      label: "Luar Area",
      value: data.summary.outOfAreaCount,
      icon: AlertTriangle,
      accent: "text-[#C92121]",
      bg: "bg-white",
    },
    {
      label: "Belum Absen",
      value: data.summary.absentCount,
      icon: UserX,
      accent: "text-[#060057]/60",
      bg: "bg-white",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#060057] tracking-tight">
            Monitoring Kehadiran Harian
          </h1>
          <p className="text-xs text-[#060057]/60 mt-0.5">
            {formatDateIndo(data.date)}
            {data.office ? ` • ${data.office.name} (Radius ${data.office.radius_meters}m)` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-white border border-[#060057]/15 rounded-xl px-3 py-2">
            <Calendar className="h-4 w-4 text-[#D74D0D] mr-2 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-xs font-bold text-[#060057] bg-transparent focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => reloadForDate(selectedDate)}
            disabled={isPending}
            aria-label="Refresh Data"
            className="h-9 px-3 rounded-xl bg-white border border-[#060057]/15 text-xs font-bold text-[#060057] hover:bg-[#F6F8F1] disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isPending ? "animate-spin text-[#D74D0D]" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {data.error && (
        <div className="p-3.5 rounded-xl bg-[#C92121]/10 border border-[#C92121]/30 text-xs font-semibold text-[#C92121]">
          {data.error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`${card.bg} border border-[#060057]/10 rounded-2xl p-4 shadow-xs flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#060057]/55">
                  {card.label}
                </span>
                <Icon className={`h-4 w-4 ${card.accent}`} />
              </div>
              <span className={`font-mono text-2xl font-black mt-2 ${card.accent}`}>
                {card.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#060057]/10 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-[#060057]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, ID pegawai, atau divisi..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-[#F6F8F1] border border-[#060057]/10 rounded-xl text-[#060057] placeholder:text-[#060057]/40 focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {FILTER_OPTIONS.map((opt) => {
            const active = activeFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setActiveFilter(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[#D74D0D] text-white"
                    : "bg-[#F6F8F1] text-[#060057]/70 hover:text-[#060057] border border-[#060057]/10"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Employee Attendance List */}
      <div className="bg-white border border-[#060057]/10 rounded-2xl shadow-xs overflow-hidden">
        {filteredRows.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <Users className="h-8 w-8 text-[#060057]/25" />
            <p className="text-sm font-bold text-[#060057]">
              Tidak ada data yang cocok
            </p>
            <p className="text-xs text-[#060057]/55">
              Ubah kata kunci pencarian atau filter status di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#060057]/10">
            {filteredRows.map(({ profile, attendance, tasks }) => {
              const isExpanded = expandedUserIds.has(profile.id);
              const mapsUrl =
                attendance?.lat_in != null && attendance?.long_in != null
                  ? `https://www.google.com/maps?q=${attendance.lat_in},${attendance.long_in}`
                  : null;

              return (
                <div key={profile.id} className="p-4 hover:bg-[#F6F8F1]/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Employee Info */}
                    <div className="flex items-start justify-between gap-3 min-w-0 lg:w-64">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#060057] truncate">
                          {profile.full_name}
                        </p>
                        <p className="text-[11px] font-medium text-[#060057]/60 mt-0.5">
                          <span className="font-mono font-semibold text-[#D74D0D]">
                            {profile.employee_id}
                          </span>
                          {profile.department ? ` • ${profile.department}` : ""}
                        </p>
                      </div>
                      <div className="lg:hidden shrink-0">
                        <AttendanceStatusBadge status={attendance?.status} />
                      </div>
                    </div>

                    {/* Timestamps & Duration */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs lg:flex lg:items-center lg:gap-6">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-[#060057]/45">
                          Masuk
                        </span>
                        <span className="font-mono font-bold text-[#060057]">
                          {formatTimeWIB(attendance?.clock_in)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-[#060057]/45">
                          Keluar
                        </span>
                        <span className="font-mono font-bold text-[#060057]">
                          {formatTimeWIB(attendance?.clock_out)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-[#060057]/45">
                          Durasi
                        </span>
                        <span className="font-mono font-bold text-[#060057]/80">
                          {calculateDurationLabel(
                            attendance?.clock_in,
                            attendance?.clock_out
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Status, GPS Link & Expand Tasks */}
                    <div className="flex flex-wrap items-center gap-2 justify-between lg:justify-end">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="hidden lg:block">
                          <AttendanceStatusBadge status={attendance?.status} />
                        </div>
                        {attendance && (
                          <GeofenceBadge isOutOfArea={attendance.is_out_of_area} />
                        )}
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border border-[#060057]/15 bg-white text-[#060057] hover:border-[#D74D0D]/50 hover:text-[#D74D0D] transition-colors"
                          >
                            <MapPin className="h-3 w-3" />
                            <span>Peta</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>

                      {attendance && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(profile.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F6F8F1] border border-[#060057]/10 text-[#060057] hover:border-[#060057]/30 transition-colors"
                        >
                          <ListTodo className="h-3.5 w-3.5 text-[#D74D0D]" />
                          <span>{tasks.length} Tugas</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail: Notes & Tasks */}
                  {isExpanded && attendance && (
                    <div className="mt-3 pt-3 border-t border-dashed border-[#060057]/10 flex flex-col gap-2">
                      {attendance.notes && (
                        <p className="text-xs text-[#060057]/75 bg-[#F6F8F1] px-3 py-2 rounded-xl border border-[#060057]/10">
                          <span className="font-bold text-[#060057]">Catatan: </span>
                          {attendance.notes}
                        </p>
                      )}

                      {tasks.length === 0 ? (
                        <p className="text-xs text-[#060057]/50 italic">
                          Pegawai ini belum mencatat aktivitas harian pada tanggal ini.
                        </p>
                      ) : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {tasks.map((task) => (
                            <li
                              key={task.id}
                              className="flex items-start justify-between gap-2 bg-[#F6F8F1] border border-[#060057]/10 rounded-xl px-3 py-2"
                            >
                              <span className="text-xs font-medium text-[#060057] leading-snug">
                                {task.task_description}
                              </span>
                              <TaskStatusBadge status={task.status} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

