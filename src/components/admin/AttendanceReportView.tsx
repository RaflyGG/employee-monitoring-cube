"use client";

import { useState, useTransition } from "react";
import {
  Download,
  Filter,
  Calendar,
  MapPin,
  ExternalLink,
  ListTodo,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from "lucide-react";
import {
  getAdminAttendanceReport,
  type AdminAttendanceReportResult,
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

function escapeCsvCell(value: string): string {
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

export function AttendanceReportView({
  initialData,
  defaultStartDate,
  defaultEndDate,
}: {
  initialData: AdminAttendanceReportResult;
  defaultStartDate: string;
  defaultEndDate: string;
}) {
  const [data, setData] = useState<AdminAttendanceReportResult>(initialData);
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [selectedUserId, setSelectedUserId] = useState<string>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const applyFilters = () => {
    startTransition(async () => {
      const next = await getAdminAttendanceReport({
        startDate,
        endDate,
        userId: selectedUserId,
        department: selectedDepartment,
      });
      setData(next);
    });
  };

  const resetFilters = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setSelectedUserId("ALL");
    setSelectedDepartment("ALL");
    startTransition(async () => {
      const next = await getAdminAttendanceReport({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });
      setData(next);
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "Tanggal",
      "ID Pegawai",
      "Nama Pegawai",
      "Departemen",
      "Jam Masuk",
      "Jam Keluar",
      "Durasi",
      "Status",
      "Area Geofence",
      "Koordinat Masuk",
      "Catatan",
      "Aktivitas Harian",
    ];

    const lines = [headers.map(escapeCsvCell).join(",")];

    for (const row of data.rows) {
      const tasksText = (row.daily_tasks || [])
        .map((t) => `[${t.status}] ${t.task_description}`)
        .join(" | ");

      const cells = [
        row.date,
        row.profile?.employee_id || "-",
        row.profile?.full_name || "-",
        row.profile?.department || "-",
        formatTimeWIB(row.clock_in),
        formatTimeWIB(row.clock_out),
        calculateDurationLabel(row.clock_in, row.clock_out),
        row.status,
        row.is_out_of_area ? "Luar Area" : "Dalam Area",
        `${row.lat_in},${row.long_in}`,
        row.notes || "-",
        tasksText || "-",
      ];
      lines.push(cells.map(escapeCsvCell).join(","));
    }

    const blob = new Blob([`\uFEFF${lines.join("\n")}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekap-presensi-cube-${startDate}_sd_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalHours = Math.floor(data.summary.totalMinutes / 60);
  const totalRemMinutes = data.summary.totalMinutes % 60;

  return (
    <div className="flex flex-col gap-5">
      {/* Header & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#060057] tracking-tight">
            Rekap Presensi & Aktivitas
          </h1>
          <p className="text-xs text-[#060057]/60 mt-0.5">
            Filter riwayat lintas pegawai dan unduh laporan CSV untuk Excel
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={data.rows.length === 0}
          className="h-10 px-4 rounded-xl bg-[#D74D0D] hover:bg-[#b83f09] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV ({data.rows.length})</span>
        </button>
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-[#060057]/10 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-[11px] font-bold text-[#060057]/70 mb-1">
            Dari Tanggal
          </label>
          <div className="flex items-center bg-[#F6F8F1] border border-[#060057]/15 rounded-xl px-3 py-2">
            <Calendar className="h-3.5 w-3.5 text-[#D74D0D] mr-2 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs font-semibold text-[#060057] bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#060057]/70 mb-1">
            Sampai Tanggal
          </label>
          <div className="flex items-center bg-[#F6F8F1] border border-[#060057]/15 rounded-xl px-3 py-2">
            <Calendar className="h-3.5 w-3.5 text-[#D74D0D] mr-2 shrink-0" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs font-semibold text-[#060057] bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#060057]/70 mb-1">
            Pegawai
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full bg-[#F6F8F1] border border-[#060057]/15 rounded-xl px-3 py-2 text-xs font-semibold text-[#060057] focus:outline-none"
          >
            <option value="ALL">Semua Pegawai</option>
            {data.employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#060057]/70 mb-1">
            Departemen
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-[#F6F8F1] border border-[#060057]/15 rounded-xl px-3 py-2 text-xs font-semibold text-[#060057] focus:outline-none"
          >
            <option value="ALL">Semua Departemen</option>
            {data.departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applyFilters}
            disabled={isPending}
            className="flex-1 h-9 px-3 rounded-xl bg-[#060057] hover:bg-[#060057]/90 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{isPending ? "Memuat..." : "Terapkan"}</span>
          </button>
          <button
            type="button"
            onClick={resetFilters}
            disabled={isPending}
            className="h-9 px-3 rounded-xl border border-[#060057]/15 text-xs font-bold text-[#060057]/70 hover:bg-[#F6F8F1] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#060057]/10 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#060057]/55">
            Total Kehadiran
          </span>
          <p className="font-mono text-2xl font-black text-[#060057] mt-1">
            {data.summary.totalRecords}
          </p>
        </div>
        <div className="bg-white border border-[#060057]/10 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#060057]/55">
            Tepat Waktu
          </span>
          <p className="font-mono text-2xl font-black text-emerald-600 mt-1">
            {data.summary.onTimeCount}
          </p>
        </div>
        <div className="bg-white border border-[#060057]/10 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#060057]/55">
            Terlambat / Luar Area
          </span>
          <p className="font-mono text-2xl font-black text-[#D74D0D] mt-1">
            {data.summary.lateCount}
            <span className="text-sm text-[#C92121] ml-1.5">
              / {data.summary.outOfAreaCount}
            </span>
          </p>
        </div>
        <div className="bg-white border border-[#060057]/10 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#060057]/55">
            Akumulasi Jam Kerja
          </span>
          <p className="font-mono text-2xl font-black text-[#060057] mt-1">
            {totalHours}j {totalRemMinutes}m
          </p>
        </div>
      </div>

      {data.error && (
        <div className="p-3.5 rounded-xl bg-[#C92121]/10 border border-[#C92121]/30 text-xs font-semibold text-[#C92121]">
          {data.error}
        </div>
      )}

      {/* Records List */}
      <div className="bg-white border border-[#060057]/10 rounded-2xl shadow-xs overflow-hidden">
        {data.rows.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-[#060057]/25" />
            <p className="text-sm font-bold text-[#060057]">
              Belum ada data presensi pada periode ini
            </p>
            <p className="text-xs text-[#060057]/55">
              Perluas rentang tanggal atau pilih filter pegawai lainnya.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#060057]/10">
            {data.rows.map((row) => {
              const isExpanded = expandedIds.has(row.id);
              const tasks = row.daily_tasks || [];
              const mapsUrl = `https://www.google.com/maps?q=${row.lat_in},${row.long_in}`;

              return (
                <div key={row.id} className="p-4 hover:bg-[#F6F8F1]/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="min-w-0 lg:w-72">
                      <p className="text-[11px] font-bold text-[#D74D0D]">
                        {formatDateIndo(row.date)}
                      </p>
                      <p className="text-sm font-bold text-[#060057] truncate mt-0.5">
                        {row.profile?.full_name || "Pegawai"}
                      </p>
                      <p className="text-[11px] text-[#060057]/60">
                        <span className="font-mono">
                          {row.profile?.employee_id || "-"}
                        </span>
                        {row.profile?.department
                          ? ` • ${row.profile.department}`
                          : ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs lg:flex lg:items-center lg:gap-6">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-[#060057]/45">
                          Masuk
                        </span>
                        <span className="font-mono font-bold text-[#060057]">
                          {formatTimeWIB(row.clock_in)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-[#060057]/45">
                          Keluar
                        </span>
                        <span className="font-mono font-bold text-[#060057]">
                          {formatTimeWIB(row.clock_out)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-[#060057]/45">
                          Durasi
                        </span>
                        <span className="font-mono font-bold text-[#060057]/80">
                          {calculateDurationLabel(row.clock_in, row.clock_out)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-between lg:justify-end">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <AttendanceStatusBadge status={row.status} />
                        <GeofenceBadge isOutOfArea={row.is_out_of_area} />
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border border-[#060057]/15 bg-white text-[#060057] hover:border-[#D74D0D]/50 hover:text-[#D74D0D]"
                        >
                          <MapPin className="h-3 w-3" />
                          <span>Peta</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(row.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F6F8F1] border border-[#060057]/10 text-[#060057]"
                      >
                        <ListTodo className="h-3.5 w-3.5 text-[#D74D0D]" />
                        <span>{tasks.length} Tugas</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-dashed border-[#060057]/10 flex flex-col gap-2">
                      {row.notes && (
                        <p className="text-xs text-[#060057]/75 bg-[#F6F8F1] px-3 py-2 rounded-xl border border-[#060057]/10">
                          <span className="font-bold text-[#060057]">Catatan: </span>
                          {row.notes}
                        </p>
                      )}
                      {tasks.length === 0 ? (
                        <p className="text-xs text-[#060057]/50 italic">
                          Tidak ada aktivitas tercatat pada tanggal ini.
                        </p>
                      ) : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {tasks.map((task) => (
                            <li
                              key={task.id}
                              className="flex items-start justify-between gap-2 bg-[#F6F8F1] border border-[#060057]/10 rounded-xl px-3 py-2"
                            >
                              <span className="text-xs font-medium text-[#060057]">
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

