"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/actions/auth";
import { getJakartaTodayDate } from "@/lib/date";
import type {
  Attendance,
  DailyTask,
  Office,
  Profile,
  UserRole,
} from "@/types/database";

export interface AdminContext {
  userId: string;
  profile: Profile;
  isHrAdmin: boolean;
}

export interface EmployeeDailyRow {
  profile: Profile;
  attendance: Attendance | null;
  tasks: DailyTask[];
}

export interface AdminDailyOverviewResult {
  date: string;
  office: Office | null;
  summary: {
    totalActiveEmployees: number;
    presentCount: number;
    onTimeCount: number;
    lateCount: number;
    outOfAreaCount: number;
    absentCount: number;
  };
  rows: EmployeeDailyRow[];
  error?: string;
}

export interface AdminAttendanceReportRow extends Attendance {
  profile: Pick<Profile, "id" | "employee_id" | "full_name" | "department" | "role"> | null;
}

export interface AdminAttendanceReportResult {
  rows: AdminAttendanceReportRow[];
  employees: Profile[];
  departments: string[];
  summary: {
    totalRecords: number;
    onTimeCount: number;
    lateCount: number;
    outOfAreaCount: number;
    totalMinutes: number;
  };
  error?: string;
}

/**
 * Verifies the active session belongs to HR_ADMIN or SUPERVISOR.
 */
export async function requireAdminContext(): Promise<AdminContext> {
  const { user, profile } = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (
    !profile ||
    (profile.role !== "HR_ADMIN" && profile.role !== "SUPERVISOR")
  ) {
    redirect("/");
  }

  return {
    userId: user.id,
    profile,
    isHrAdmin: profile.role === "HR_ADMIN",
  };
}

/**
 * Fetch live daily attendance & daily tasks across all active employees for a target date.
 */
export async function getAdminDailyOverview(
  targetDate?: string
): Promise<AdminDailyOverviewResult> {
  await requireAdminContext();
  const supabase = await createClient();
  const date = targetDate || getJakartaTodayDate();

  const [profilesRes, attendancesRes, officeRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true }),
    supabase
      .from("attendances")
      .select("*, daily_tasks(*)")
      .eq("date", date)
      .order("clock_in", { ascending: true }),
    supabase.from("offices").select("*").limit(1).maybeSingle(),
  ]);

  if (profilesRes.error) {
    return {
      date,
      office: (officeRes.data as Office) || null,
      summary: {
        totalActiveEmployees: 0,
        presentCount: 0,
        onTimeCount: 0,
        lateCount: 0,
        outOfAreaCount: 0,
        absentCount: 0,
      },
      rows: [],
      error: `Gagal memuat data pegawai: ${profilesRes.error.message}`,
    };
  }

  const allProfiles = (profilesRes.data as Profile[]) || [];
  const activeProfiles = allProfiles.filter((p) => p.is_active);
  const attendances = (attendancesRes.data as Attendance[]) || [];

  const attendanceByUser = new Map<string, Attendance>();
  for (const att of attendances) {
    attendanceByUser.set(att.user_id, att);
  }

  let onTimeCount = 0;
  let lateCount = 0;
  let outOfAreaCount = 0;
  let presentCount = 0;

  const rows: EmployeeDailyRow[] = activeProfiles.map((prof) => {
    const att = attendanceByUser.get(prof.id) || null;
    if (att) {
      presentCount++;
      if (att.status === "ONTIME") onTimeCount++;
      if (att.status === "LATE") lateCount++;
      if (att.is_out_of_area) outOfAreaCount++;
    }
    return {
      profile: prof,
      attendance: att,
      tasks: att?.daily_tasks || [],
    };
  });

  // Sort: present employees first (latest/in-progress visible), absent below
  rows.sort((a, b) => {
    if (a.attendance && !b.attendance) return -1;
    if (!a.attendance && b.attendance) return 1;
    return a.profile.full_name.localeCompare(b.profile.full_name);
  });

  return {
    date,
    office: (officeRes.data as Office) || null,
    summary: {
      totalActiveEmployees: activeProfiles.length,
      presentCount,
      onTimeCount,
      lateCount,
      outOfAreaCount,
      absentCount: Math.max(0, activeProfiles.length - presentCount),
    },
    rows,
    error: attendancesRes.error
      ? `Gagal memuat presensi: ${attendancesRes.error.message}`
      : undefined,
  };
}

/**
 * Fetch filterable multi-day attendance and task report across employees.
 */
export async function getAdminAttendanceReport(filters: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  department?: string;
}): Promise<AdminAttendanceReportResult> {
  await requireAdminContext();
  const supabase = await createClient();

  const today = getJakartaTodayDate();
  const defaultStart = `${today.slice(0, 7)}-01`;
  const startDate = filters.startDate || defaultStart;
  const endDate = filters.endDate || today;

  let attQuery = supabase
    .from("attendances")
    .select("*, daily_tasks(*)")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("clock_in", { ascending: false });

  if (filters.userId && filters.userId !== "ALL") {
    attQuery = attQuery.eq("user_id", filters.userId);
  }

  const [profilesRes, attRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true }),
    attQuery,
  ]);

  const employees = (profilesRes.data as Profile[]) || [];
  const profileMap = new Map<string, Profile>();
  const deptSet = new Set<string>();

  for (const emp of employees) {
    profileMap.set(emp.id, emp);
    if (emp.department?.trim()) {
      deptSet.add(emp.department.trim());
    }
  }

  const rawRows = (attRes.data as Attendance[]) || [];
  const mergedRows: AdminAttendanceReportRow[] = [];

  let onTimeCount = 0;
  let lateCount = 0;
  let outOfAreaCount = 0;
  let totalMinutes = 0;

  for (const row of rawRows) {
    const prof = profileMap.get(row.user_id) || null;
    if (
      filters.department &&
      filters.department !== "ALL" &&
      (prof?.department || "") !== filters.department
    ) {
      continue;
    }

    if (row.status === "ONTIME") onTimeCount++;
    if (row.status === "LATE") lateCount++;
    if (row.is_out_of_area) outOfAreaCount++;
    if (row.clock_in && row.clock_out) {
      const diffMs =
        new Date(row.clock_out).getTime() - new Date(row.clock_in).getTime();
      if (diffMs > 0) {
        totalMinutes += Math.floor(diffMs / (1000 * 60));
      }
    }

    mergedRows.push({
      ...row,
      profile: prof
        ? {
            id: prof.id,
            employee_id: prof.employee_id,
            full_name: prof.full_name,
            department: prof.department,
            role: prof.role,
          }
        : null,
    });
  }

  return {
    rows: mergedRows,
    employees,
    departments: Array.from(deptSet).sort(),
    summary: {
      totalRecords: mergedRows.length,
      onTimeCount,
      lateCount,
      outOfAreaCount,
      totalMinutes,
    },
    error:
      profilesRes.error?.message || attRes.error?.message || undefined,
  };
}

/**
 * Fetch all employees and offices for Admin management screen.
 */
export async function getAdminEmployeesData(): Promise<{
  employees: Profile[];
  offices: Office[];
  isHrAdmin: boolean;
  error?: string;
}> {
  const ctx = await requireAdminContext();
  const supabase = await createClient();

  const [profilesRes, officesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true }),
    supabase.from("offices").select("*").order("name", { ascending: true }),
  ]);

  return {
    employees: (profilesRes.data as Profile[]) || [],
    offices: (officesRes.data as Office[]) || [],
    isHrAdmin: ctx.isHrAdmin,
    error: profilesRes.error?.message || officesRes.error?.message || undefined,
  };
}

/**
 * Update employee department, assigned office, role, and active status.
 */
export async function updateEmployeeAction(payload: {
  id: string;
  department: string | null;
  office_id: string | null;
  role: UserRole;
  is_active: boolean;
}): Promise<{ success?: boolean; error?: string }> {
  const ctx = await requireAdminContext();
  if (!ctx.isHrAdmin) {
    return {
      error: "Hanya akun dengan role HR_ADMIN yang dapat mengubah data pegawai.",
    };
  }

  if (payload.id === ctx.userId && !payload.is_active) {
    return { error: "Anda tidak dapat menonaktifkan akun Anda sendiri." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      department: payload.department?.trim() || null,
      office_id: payload.office_id || null,
      role: payload.role,
      is_active: payload.is_active,
    })
    .eq("id", payload.id);

  if (error) {
    return {
      error:
        error.message ||
        "Gagal memperbarui data pegawai. Pastikan RLS admin sudah dijalankan.",
    };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Fetch all configured offices.
 */
export async function getAdminOffices(): Promise<{
  offices: Office[];
  isHrAdmin: boolean;
  error?: string;
}> {
  const ctx = await requireAdminContext();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .order("name", { ascending: true });

  return {
    offices: (data as Office[]) || [],
    isHrAdmin: ctx.isHrAdmin,
    error: error?.message,
  };
}

/**
 * Create or update an office geofence & work schedule configuration.
 */
export async function upsertOfficeAction(payload: {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  work_start_time: string;
  work_end_time: string;
  timezone?: string;
}): Promise<{ success?: boolean; error?: string; office?: Office }> {
  const ctx = await requireAdminContext();
  if (!ctx.isHrAdmin) {
    return {
      error: "Hanya akun dengan role HR_ADMIN yang dapat mengatur lokasi kantor.",
    };
  }

  const name = payload.name.trim();
  if (!name) {
    return { error: "Nama kantor wajib diisi." };
  }
  if (
    !Number.isFinite(payload.latitude) ||
    payload.latitude < -90 ||
    payload.latitude > 90
  ) {
    return { error: "Latitude harus berada di antara -90 hingga 90." };
  }
  if (
    !Number.isFinite(payload.longitude) ||
    payload.longitude < -180 ||
    payload.longitude > 180
  ) {
    return { error: "Longitude harus berada di antara -180 hingga 180." };
  }
  if (!Number.isFinite(payload.radius_meters) || payload.radius_meters < 10) {
    return { error: "Radius geofence minimal 10 meter." };
  }

  const normalizeTime = (t: string, fallback: string) => {
    const clean = t.trim();
    if (/^\d{2}:\d{2}$/.test(clean)) return `${clean}:00`;
    if (/^\d{2}:\d{2}:\d{2}$/.test(clean)) return clean;
    return fallback;
  };

  const record = {
    name,
    latitude: payload.latitude,
    longitude: payload.longitude,
    radius_meters: Math.round(payload.radius_meters),
    work_start_time: normalizeTime(payload.work_start_time, "08:00:00"),
    work_end_time: normalizeTime(payload.work_end_time, "17:00:00"),
    timezone: payload.timezone?.trim() || "Asia/Jakarta",
  };

  const supabase = await createClient();
  const query = payload.id
    ? supabase.from("offices").update(record).eq("id", payload.id)
    : supabase.from("offices").insert(record);

  const { data, error } = await query.select("*").single();

  if (error) {
    return {
      error:
        error.message ||
        "Gagal menyimpan kantor. Pastikan RLS admin sudah dijalankan.",
    };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return { success: true, office: data as Office };
}

