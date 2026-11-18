import type {
  AttendanceStatus,
  TaskStatus,
  UserRole,
} from "@/types/database";

const ATTENDANCE_BADGE_MAP: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  ONTIME: {
    label: "Tepat Waktu",
    className:
      "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  LATE: {
    label: "Terlambat",
    className:
      "bg-[#E9B501]/20 dark:bg-[#E9B501]/15 text-[#060057] dark:text-[#FCD34D] border-[#E9B501]/60 dark:border-[#E9B501]/40",
  },
  ABSENT: {
    label: "Tidak Hadir",
    className:
      "bg-[#C92121]/10 dark:bg-[#EF4444]/15 text-[#C92121] dark:text-[#EF4444] border-[#C92121]/30 dark:border-[#EF4444]/30",
  },
  LEAVE: {
    label: "Izin / Cuti",
    className:
      "bg-[#060057]/10 dark:bg-white/10 text-[#060057] dark:text-[#F6F8F1] border-[#060057]/20 dark:border-white/20",
  },
};

const TASK_BADGE_MAP: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  COMPLETED: {
    label: "Selesai",
    className:
      "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  IN_PROGRESS: {
    label: "Progres",
    className:
      "bg-[#E9B501]/20 dark:bg-[#E9B501]/15 text-[#060057] dark:text-[#FCD34D] border-[#E9B501]/60 dark:border-[#E9B501]/40",
  },
  BLOCKED: {
    label: "Kendala",
    className:
      "bg-[#C92121]/10 dark:bg-[#EF4444]/15 text-[#C92121] dark:text-[#EF4444] border-[#C92121]/30 dark:border-[#EF4444]/30",
  },
};

const ROLE_BADGE_MAP: Record<UserRole, { label: string; className: string }> = {
  HR_ADMIN: {
    label: "HR Admin",
    className:
      "bg-[#060057] dark:bg-[#1B2234] text-white dark:text-[#F6F8F1] border-[#060057] dark:border-white/20",
  },
  SUPERVISOR: {
    label: "Supervisor",
    className:
      "bg-[#D74D0D]/15 dark:bg-[#FF6B2B]/20 text-[#D74D0D] dark:text-[#FF6B2B] border-[#D74D0D]/30 dark:border-[#FF6B2B]/30",
  },
  EMPLOYEE: {
    label: "Pegawai",
    className:
      "bg-[#F6F8F1] dark:bg-[#0B0E17] text-[#060057]/80 dark:text-[#F6F8F1]/80 border-[#060057]/15 dark:border-white/10",
  },
};

export function AttendanceStatusBadge({
  status,
}: {
  status?: AttendanceStatus | null;
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border bg-[#F6F8F1] dark:bg-[#0B0E17] text-[#060057]/60 dark:text-[#F6F8F1]/60 border-[#060057]/15 dark:border-white/10">
        Belum Absen
      </span>
    );
  }
  const badge = ATTENDANCE_BADGE_MAP[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

export function GeofenceBadge({ isOutOfArea }: { isOutOfArea: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
        isOutOfArea
          ? "bg-[#C92121]/10 dark:bg-[#EF4444]/15 text-[#C92121] dark:text-[#EF4444] border-[#C92121]/30 dark:border-[#EF4444]/30"
          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      }`}
    >
      {isOutOfArea ? "Luar Area" : "Dalam Area"}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const badge = TASK_BADGE_MAP[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const badge = ROLE_BADGE_MAP[role];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

