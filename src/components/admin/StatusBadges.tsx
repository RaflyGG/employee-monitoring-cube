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
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  LATE: {
    label: "Terlambat",
    className: "bg-[#E9B501]/20 text-[#060057] border-[#E9B501]/60",
  },
  ABSENT: {
    label: "Tidak Hadir",
    className: "bg-[#C92121]/10 text-[#C92121] border-[#C92121]/30",
  },
  LEAVE: {
    label: "Izin / Cuti",
    className: "bg-[#060057]/10 text-[#060057] border-[#060057]/20",
  },
};

const TASK_BADGE_MAP: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  COMPLETED: {
    label: "Selesai",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  IN_PROGRESS: {
    label: "Progres",
    className: "bg-[#E9B501]/20 text-[#060057] border-[#E9B501]/60",
  },
  BLOCKED: {
    label: "Kendala",
    className: "bg-[#C92121]/10 text-[#C92121] border-[#C92121]/30",
  },
};

const ROLE_BADGE_MAP: Record<UserRole, { label: string; className: string }> = {
  HR_ADMIN: {
    label: "HR Admin",
    className: "bg-[#060057] text-white border-[#060057]",
  },
  SUPERVISOR: {
    label: "Supervisor",
    className: "bg-[#D74D0D]/15 text-[#D74D0D] border-[#D74D0D]/30",
  },
  EMPLOYEE: {
    label: "Pegawai",
    className: "bg-[#F6F8F1] text-[#060057]/80 border-[#060057]/15",
  },
};

export function AttendanceStatusBadge({
  status,
}: {
  status?: AttendanceStatus | null;
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border bg-[#F6F8F1] text-[#060057]/60 border-[#060057]/15">
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
          ? "bg-[#C92121]/10 text-[#C92121] border-[#C92121]/30"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
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

