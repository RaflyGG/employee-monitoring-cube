"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { DailyTask, TaskStatus } from "@/types/database";

function getJakartaTodayDate(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

export interface TasksResult {
  tasks: DailyTask[];
  hasClockedInToday: boolean;
  attendanceId: string | null;
  error?: string | null;
}

/**
 * Fetch daily tasks linked to today's attendance
 */
export async function getTodayTasks(): Promise<TasksResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      tasks: [],
      hasClockedInToday: false,
      attendanceId: null,
      error: "Sesi telah berakhir.",
    };
  }

  const todayStr = getJakartaTodayDate();

  // 1. Get today's attendance
  const { data: attendance } = await supabase
    .from("attendances")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .maybeSingle();

  if (!attendance) {
    return {
      tasks: [],
      hasClockedInToday: false,
      attendanceId: null,
    };
  }

  // 2. Fetch tasks for this attendance
  const { data: tasks, error: tasksError } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("attendance_id", attendance.id);

  if (tasksError) {
    console.error("Gagal mengambil daftar tugas:", tasksError);
    return {
      tasks: [],
      hasClockedInToday: true,
      attendanceId: attendance.id,
      error: tasksError.message,
    };
  }

  return {
    tasks: (tasks as DailyTask[]) || [],
    hasClockedInToday: true,
    attendanceId: attendance.id,
  };
}

/**
 * Action: Create a new daily task
 */
export async function createTaskAction(payload: {
  task_description: string;
  status?: TaskStatus;
}): Promise<{ success?: boolean; error?: string | null; task?: DailyTask }> {
  if (!payload.task_description?.trim()) {
    return { error: "Deskripsi tugas tidak boleh kosong." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const todayStr = getJakartaTodayDate();

  // Verify today's attendance exists
  const { data: attendance } = await supabase
    .from("attendances")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .maybeSingle();

  if (!attendance) {
    return {
      error:
        "Anda belum melakukan Clock-In hari ini. Silakan Clock-In di tab Absen terlebih dahulu.",
    };
  }

  const { data: newTask, error: insertError } = await supabase
    .from("daily_tasks")
    .insert({
      user_id: user.id,
      attendance_id: attendance.id,
      task_description: payload.task_description.trim(),
      status: payload.status || "IN_PROGRESS",
    })
    .select("*")
    .single();

  if (insertError) {
    return { error: insertError.message || "Gagal menambahkan tugas." };
  }

  revalidatePath("/aktivitas");
  return { success: true, task: newTask as DailyTask };
}

/**
 * Action: Update task status (IN_PROGRESS, COMPLETED, BLOCKED)
 */
export async function updateTaskStatusAction(
  taskId: string,
  newStatus: TaskStatus
): Promise<{ success?: boolean; error?: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi telah berakhir." };
  }

  const { error } = await supabase
    .from("daily_tasks")
    .update({ status: newStatus })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message || "Gagal memperbarui status tugas." };
  }

  revalidatePath("/aktivitas");
  return { success: true };
}

/**
 * Action: Delete a daily task
 */
export async function deleteTaskAction(
  taskId: string
): Promise<{ success?: boolean; error?: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi telah berakhir." };
  }

  const { error } = await supabase
    .from("daily_tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message || "Gagal menghapus tugas." };
  }

  revalidatePath("/aktivitas");
  return { success: true };
}

