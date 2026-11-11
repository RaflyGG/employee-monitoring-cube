"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateDistance, DEFAULT_OFFICE } from "@/utils/geofence";
import type { Attendance, Office } from "@/types/database";

export interface AttendanceActionResult {
  success?: boolean;
  error?: string | null;
  attendance?: Attendance | null;
}

/**
 * Returns today's date in YYYY-MM-DD format based on Asia/Jakarta timezone
 */
function getJakartaTodayDate(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // Outputs YYYY-MM-DD
}

/**
 * Returns current time in HH:mm:ss format based on Asia/Jakarta timezone
 */
function getJakartaCurrentTime(): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date());
}

/**
 * Fetch today's attendance row and user's office configuration
 */
export async function getTodayAttendance(): Promise<{
  attendance: Attendance | null;
  office: Office;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const defaultOfficeData: Office = {
    id: "default",
    name: "Kantor Utama",
    latitude: DEFAULT_OFFICE.latitude,
    longitude: DEFAULT_OFFICE.longitude,
    radius_meters: DEFAULT_OFFICE.radiusMeters,
    work_start_time: "08:00:00",
    work_end_time: "17:00:00",
    timezone: "Asia/Jakarta",
  };

  if (!user) {
    return { attendance: null, office: defaultOfficeData };
  }

  // 1. Get user profile and office
  const { data: profile } = await supabase
    .from("profiles")
    .select("office_id")
    .eq("id", user.id)
    .single();

  let activeOffice: Office = defaultOfficeData;

  if (profile?.office_id) {
    const { data: officeData } = await supabase
      .from("offices")
      .select("*")
      .eq("id", profile.office_id)
      .single();
    if (officeData) {
      activeOffice = officeData as Office;
    }
  } else {
    // Check if there is any office in the table
    const { data: firstOffice } = await supabase
      .from("offices")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (firstOffice) {
      activeOffice = firstOffice as Office;
    }
  }

  // 2. Query today's attendance for user
  const todayStr = getJakartaTodayDate();
  const { data: attendance } = await supabase
    .from("attendances")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .maybeSingle();

  return {
    attendance: (attendance as Attendance) || null,
    office: activeOffice,
  };
}

/**
 * Action: Clock In Real to Supabase attendances table
 */
export async function clockInAction(payload: {
  latitude: number;
  longitude: number;
  notes?: string;
}): Promise<AttendanceActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const todayStr = getJakartaTodayDate();

  // 1. Check if already clocked in today
  const { data: existing } = await supabase
    .from("attendances")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .maybeSingle();

  if (existing) {
    return { error: "Anda sudah melakukan Clock-In untuk hari ini." };
  }

  // 2. Fetch office coordinate to check geofence
  const { office } = await getTodayAttendance();

  const distance = calculateDistance(
    payload.latitude,
    payload.longitude,
    office.latitude,
    office.longitude
  );

  const is_out_of_area = distance > office.radius_meters;

  // 3. Compare with work_start_time (default '08:00:00')
  const currentTimeStr = getJakartaCurrentTime();
  const workStartTime = office.work_start_time || "08:00:00";
  const status = currentTimeStr > workStartTime ? "LATE" : "ONTIME";

  // 4. Insert into attendances table
  const { data: newAttendance, error: insertError } = await supabase
    .from("attendances")
    .insert({
      user_id: user.id,
      date: todayStr,
      clock_in: new Date().toISOString(),
      lat_in: payload.latitude,
      long_in: payload.longitude,
      is_out_of_area,
      status,
      notes: payload.notes?.trim() || null,
    })
    .select("*")
    .single();

  if (insertError) {
    return { error: insertError.message || "Gagal mencatat Clock-In." };
  }

  revalidatePath("/", "layout");
  return { success: true, attendance: newAttendance as Attendance };
}

/**
 * Action: Clock Out Real to Supabase attendances table
 */
export async function clockOutAction(payload: {
  latitude: number;
  longitude: number;
  notes?: string;
}): Promise<AttendanceActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const todayStr = getJakartaTodayDate();

  // 1. Find today's attendance row
  const { data: todayRow, error: findError } = await supabase
    .from("attendances")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .maybeSingle();

  if (findError || !todayRow) {
    return { error: "Data Clock-In hari ini tidak ditemukan." };
  }

  if (todayRow.clock_out) {
    return { error: "Anda sudah melakukan Clock-Out hari ini." };
  }

  // 2. Combine notes if both in and out have remarks
  let combinedNotes = todayRow.notes;
  if (payload.notes?.trim()) {
    combinedNotes = combinedNotes
      ? `${combinedNotes} | Out: ${payload.notes.trim()}`
      : payload.notes.trim();
  }

  // 3. Update row with clock_out
  const { data: updatedAttendance, error: updateError } = await supabase
    .from("attendances")
    .update({
      clock_out: new Date().toISOString(),
      lat_out: payload.latitude,
      long_out: payload.longitude,
      notes: combinedNotes,
    })
    .eq("id", todayRow.id)
    .select("*")
    .single();

  if (updateError) {
    return { error: updateError.message || "Gagal mencatat Clock-Out." };
  }

  revalidatePath("/", "layout");
  return { success: true, attendance: updatedAttendance as Attendance };
}

export interface AttendanceHistoryResult {
  history: Attendance[];
  stats: {
    totalDays: number;
    onTimeCount: number;
    lateCount: number;
    totalHoursMinutes: string;
  };
}

/**
 * Action: Fetch personal attendance history and summary stats
 */
export async function getAttendanceHistory(): Promise<AttendanceHistoryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      history: [],
      stats: {
        totalDays: 0,
        onTimeCount: 0,
        lateCount: 0,
        totalHoursMinutes: "0 jam",
      },
    };
  }

  const { data: rows, error } = await supabase
    .from("attendances")
    .select(
      `
      *,
      daily_tasks (*)
    `
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Gagal mengambil riwayat absensi:", error);
    return {
      history: [],
      stats: {
        totalDays: 0,
        onTimeCount: 0,
        lateCount: 0,
        totalHoursMinutes: "0 jam",
      },
    };
  }

  const history = (rows as Attendance[]) || [];

  let totalMinutes = 0;
  let onTimeCount = 0;
  let lateCount = 0;

  history.forEach((item) => {
    if (item.status === "ONTIME") onTimeCount++;
    if (item.status === "LATE") lateCount++;
    if (item.clock_in && item.clock_out) {
      const diffMs =
        new Date(item.clock_out).getTime() - new Date(item.clock_in).getTime();
      if (diffMs > 0) {
        totalMinutes += Math.floor(diffMs / (1000 * 60));
      }
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalHoursMinutes = `${hours}j ${minutes}m`;

  return {
    history,
    stats: {
      totalDays: history.length,
      onTimeCount,
      lateCount,
      totalHoursMinutes,
    },
  };
}

