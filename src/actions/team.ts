"use server";

import { createClient } from "@/utils/supabase/server";
import { getJakartaTodayDate } from "@/lib/date";

export interface TeamMemberPresence {
  id: string;
  employee_id: string;
  full_name: string;
  department: string | null;
  isPresent: boolean;
}

export interface TeamPresenceResult {
  date: string;
  totalMembers: number;
  presentCount: number;
  members: TeamMemberPresence[];
  error?: string;
}

/**
 * Fetch simplified team presence for today (Who's In vs Who's Absent)
 * Accessible by all authenticated employees.
 */
export async function getTeamPresence(): Promise<TeamPresenceResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todayStr = getJakartaTodayDate();

  if (!user) {
    return {
      date: todayStr,
      totalMembers: 0,
      presentCount: 0,
      members: [],
      error: "Sesi telah berakhir. Silakan login kembali.",
    };
  }

  // 1. Ambil seluruh profil pegawai yang aktif
  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select("id, employee_id, full_name, department")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (profileErr) {
    return {
      date: todayStr,
      totalMembers: 0,
      presentCount: 0,
      members: [],
      error: `Gagal memuat daftar pegawai: ${profileErr.message}`,
    };
  }

  // 2. Ambil absensi hari ini yang sudah clock-in
  const { data: attendances, error: attErr } = await supabase
    .from("attendances")
    .select("user_id, clock_in")
    .eq("date", todayStr);

  if (attErr) {
    console.error("Gagal memuat absensi tim hari ini:", attErr.message);
  }

  const presentUserIds = new Set<string>();
  if (attendances) {
    for (const att of attendances) {
      if (att.clock_in) {
        presentUserIds.add(att.user_id);
      }
    }
  }

  const members: TeamMemberPresence[] = (profiles || []).map((prof) => ({
    id: prof.id,
    employee_id: prof.employee_id,
    full_name: prof.full_name,
    department: prof.department,
    isPresent: presentUserIds.has(prof.id),
  }));

  // Urutkan: yang sudah masuk kerja ditaruh di atas, lalu urut abjad
  members.sort((a, b) => {
    if (a.isPresent && !b.isPresent) return -1;
    if (!a.isPresent && b.isPresent) return 1;
    return a.full_name.localeCompare(b.full_name);
  });

  const presentCount = members.filter((m) => m.isPresent).length;

  return {
    date: todayStr,
    totalMembers: members.length,
    presentCount,
    members,
  };
}
