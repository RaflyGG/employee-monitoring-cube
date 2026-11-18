"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Square,
  Plus,
  RefreshCw,
  Trash2,
  AlertCircle,
  Clock,
  ArrowRight,
  ListTodo,
} from "lucide-react";
import {
  getTodayTasks,
  createTaskAction,
  updateTaskStatusAction,
  deleteTaskAction,
} from "@/actions/tasks";
import type { DailyTask, TaskStatus } from "@/types/database";

export default function AktivitasPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [hasClockedInToday, setHasClockedInToday] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // New task form state
  const [taskInput, setTaskInput] = useState<string>("");
  const [selectedStatus, setSelectedStatus] =
    useState<TaskStatus>("IN_PROGRESS");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load tasks from backend
  const loadTasks = useCallback(async () => {
    try {
      const data = await getTodayTasks();
      setActionError(data.error ?? null);
      setTasks(data.tasks);
      setHasClockedInToday(data.hasClockedInToday);
    } catch (err: unknown) {
      console.error("Gagal memuat tugas harian:", err);
      setActionError("Gagal memuat daftar tugas harian.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setActionError(null);
    void loadTasks();
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadTasks();
    });
  }, [loadTasks]);

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    const result = await createTaskAction({
      task_description: taskInput.trim(),
      status: selectedStatus,
    });

    setIsSubmitting(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    if (result.task) {
      setTasks((prev) => [...prev, result.task!]);
      setTaskInput("");
    }
  };

  // Toggle Task Completion
  const handleToggleStatus = async (task: DailyTask) => {
    const nextStatus: TaskStatus =
      task.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    const result = await updateTaskStatusAction(task.id, nextStatus);
    if (result.error) {
      setActionError(result.error);
      loadTasks();
    }
  };

  // Change status to specific
  const handleChangeStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const result = await updateTaskStatusAction(taskId, newStatus);
    if (result.error) {
      setActionError(result.error);
      loadTasks();
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    const result = await deleteTaskAction(taskId);
    if (result.error) {
      setActionError(result.error);
      loadTasks();
    }
  };

  // Counters
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const blockedCount = tasks.filter((t) => t.status === "BLOCKED").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-[#060057] dark:text-[#F6F8F1] tracking-tight">
            Aktivitas Hari Ini
          </h1>
          <p className="text-xs text-[#060057]/60 dark:text-[#F6F8F1]/60">
            Catat dan laporkan progres tugas harian Anda
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh Data"
          className="p-2 rounded-xl bg-white dark:bg-[#141926] border border-[#060057]/15 dark:border-white/10 text-[#060057]/70 dark:text-[#F6F8F1]/70 hover:bg-[#F6F8F1] dark:hover:bg-[#1B2234] disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isRefreshing ? "animate-spin text-[#D74D0D] dark:text-[#FF6B2B]" : ""
            }`}
          />
        </button>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3 rounded-xl bg-[#C92121]/10 dark:bg-[#EF4444]/15 border border-[#C92121]/30 dark:border-[#EF4444]/30 flex items-start gap-2.5 text-[#C92121] dark:text-[#EF4444] text-xs font-medium">
          <AlertCircle className="h-4 w-4 text-[#C92121] dark:text-[#EF4444] shrink-0 mt-0.5" />
          <span className="leading-tight">{actionError}</span>
        </div>
      )}

      {/* State: User has NOT clocked in today */}
      {!isLoading && !hasClockedInToday && (
        <div className="bg-white dark:bg-[#141926] border border-[#060057]/10 dark:border-white/10 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center gap-3 transition-colors duration-150">
          <div className="h-12 w-12 rounded-2xl bg-[#E9B501]/20 dark:bg-[#E9B501]/15 border border-[#E9B501]/40 dark:border-[#E9B501]/30 flex items-center justify-center text-[#D74D0D] dark:text-[#FF6B2B]">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#060057] dark:text-[#F6F8F1]">
              Belum Clock-In Hari Ini
            </h2>
            <p className="text-xs text-[#060057]/60 dark:text-[#F6F8F1]/60 mt-1 max-w-[260px]">
              Lakukan Clock-In terlebih dahulu di tab Absen agar tugas harian
              dapat tercatat ke sesi kehadiran Anda.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D74D0D] hover:bg-[#b83e08] dark:bg-[#FF6B2B] dark:hover:bg-[#e05517] active:scale-[0.99] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <span>Ke Halaman Absen</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Main Flow: User has clocked in */}
      {(!isLoading && hasClockedInToday) || isLoading ? (
        <>
          {/* Mini Task Stats Counter */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white dark:bg-[#141926] p-2.5 rounded-xl border border-[#060057]/10 dark:border-white/10 shadow-xs flex items-center gap-2 transition-colors duration-150">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E9B501] dark:bg-[#FCD34D] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#060057]/55 dark:text-[#F6F8F1]/55 font-medium">
                  Dalam Proses
                </span>
                <span className="text-xs font-extrabold text-[#060057] dark:text-[#F6F8F1]">
                  {inProgressCount} Tugas
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#141926] p-2.5 rounded-xl border border-[#060057]/10 dark:border-white/10 shadow-xs flex items-center gap-2 transition-colors duration-150">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#060057]/55 dark:text-[#F6F8F1]/55 font-medium">
                  Selesai
                </span>
                <span className="text-xs font-extrabold text-[#060057] dark:text-[#F6F8F1]">
                  {completedCount} Tugas
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#141926] p-2.5 rounded-xl border border-[#060057]/10 dark:border-white/10 shadow-xs flex items-center gap-2 transition-colors duration-150">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C92121] dark:bg-[#EF4444] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#060057]/55 dark:text-[#F6F8F1]/55 font-medium">
                  Terkendala
                </span>
                <span className="text-xs font-extrabold text-[#060057] dark:text-[#F6F8F1]">
                  {blockedCount} Tugas
                </span>
              </div>
            </div>
          </div>

          {/* New Task Input Card */}
          <section className="bg-white dark:bg-[#141926] border border-[#060057]/10 dark:border-white/10 rounded-2xl p-4 shadow-xs transition-colors duration-150">
            <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
              <label
                htmlFor="new-task-desc"
                className="text-xs font-bold text-[#060057] dark:text-[#F6F8F1]"
              >
                Tambah Pekerjaan / Tugas Baru
              </label>

              <textarea
                id="new-task-desc"
                rows={2}
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Contoh: Selesaikan modul validasi geofence absensi..."
                required
                className="w-full text-sm p-3 border border-[#060057]/15 dark:border-white/10 rounded-xl bg-[#F6F8F1]/40 dark:bg-[#0B0E17]/60 focus:bg-white dark:focus:bg-[#0B0E17] focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/20 focus:border-[#D74D0D] text-[#060057] dark:text-[#F6F8F1] placeholder:text-[#060057]/35 dark:placeholder:text-[#F6F8F1]/30 transition"
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-[#060057]/60 dark:text-[#F6F8F1]/60 font-semibold">
                    Status:
                  </span>
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as TaskStatus)
                    }
                    className="text-xs font-semibold py-1.5 px-2.5 border border-[#060057]/15 dark:border-white/10 rounded-lg bg-[#F6F8F1] dark:bg-[#0B0E17] text-[#060057] dark:text-[#F6F8F1] focus:outline-none"
                  >
                    <option value="IN_PROGRESS">Dalam Proses</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="BLOCKED">Terkendala</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !taskInput.trim()}
                  className="h-10 px-4 bg-[#D74D0D] hover:bg-[#b83e08] dark:bg-[#FF6B2B] dark:hover:bg-[#e05517] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs shadow-[#D74D0D]/20 transition"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Task List */}
          {isLoading ? (
            <div className="bg-white dark:bg-[#141926] border border-[#060057]/10 dark:border-white/10 rounded-2xl p-8 text-center shadow-xs">
              <RefreshCw className="h-5 w-5 text-[#D74D0D] dark:text-[#FF6B2B] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#060057]/60 dark:text-[#F6F8F1]/60 font-medium">
                Memuat daftar tugas...
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white dark:bg-[#141926] border border-[#060057]/10 dark:border-white/10 rounded-2xl p-8 text-center shadow-xs flex flex-col items-center">
              <ListTodo className="h-8 w-8 text-[#060057]/25 dark:text-[#F6F8F1]/25 mb-2" />
              <p className="text-sm font-bold text-[#060057] dark:text-[#F6F8F1]">
                Belum Ada Tugas
              </p>
              <p className="text-xs text-[#060057]/50 dark:text-[#F6F8F1]/50 mt-1 max-w-[240px]">
                Mulai hari kerja Anda dengan menambahkan rencana tugas di atas.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {tasks.map((task) => {
                const isCompleted = task.status === "COMPLETED";
                const isBlocked = task.status === "BLOCKED";

                return (
                  <div
                    key={task.id}
                    className={`border rounded-2xl p-3.5 shadow-xs flex items-start justify-between gap-3 transition-all ${
                      isCompleted
                        ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/15 dark:bg-emerald-950/20"
                        : isBlocked
                        ? "border-[#C92121]/30 dark:border-[#EF4444]/30 bg-[#C92121]/5 dark:bg-[#EF4444]/10"
                        : "bg-white dark:bg-[#141926] border-[#060057]/10 dark:border-white/10"
                    }`}
                  >
                    {/* Left: Checkbox Toggle & Description */}
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(task)}
                        aria-label="Toggle Selesai"
                        className="mt-0.5 text-[#060057]/30 dark:text-[#F6F8F1]/30 hover:text-[#D74D0D] dark:hover:text-[#FF6B2B] transition shrink-0"
                      >
                        {isCompleted ? (
                          <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="h-5 w-5 text-[#060057]/25 dark:text-[#F6F8F1]/25 hover:text-[#060057]/50 dark:hover:text-[#F6F8F1]/50" />
                        )}
                      </button>

                      <div className="flex flex-col flex-1 min-w-0">
                        <span
                          className={`text-sm leading-snug break-words ${
                            isCompleted
                              ? "line-through text-[#060057]/40 dark:text-[#F6F8F1]/40"
                              : "text-[#060057] dark:text-[#F6F8F1] font-semibold"
                          }`}
                        >
                          {task.task_description}
                        </span>

                        {/* Status Switcher Chips */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(task.id, "IN_PROGRESS")
                            }
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition ${
                              task.status === "IN_PROGRESS"
                                ? "bg-[#E9B501]/25 dark:bg-[#E9B501]/15 text-[#7d6000] dark:text-[#FCD34D] border border-[#E9B501]/50 dark:border-[#E9B501]/30"
                                : "text-[#060057]/40 dark:text-[#F6F8F1]/40 hover:text-[#060057] dark:hover:text-[#F6F8F1]"
                            }`}
                          >
                            Proses
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(task.id, "COMPLETED")
                            }
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition ${
                              task.status === "COMPLETED"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "text-[#060057]/40 dark:text-[#F6F8F1]/40 hover:text-[#060057] dark:hover:text-[#F6F8F1]"
                            }`}
                          >
                            Selesai
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(task.id, "BLOCKED")
                            }
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition ${
                              task.status === "BLOCKED"
                                ? "bg-[#C92121]/15 dark:bg-[#EF4444]/20 text-[#C92121] dark:text-[#EF4444] border border-[#C92121]/30 dark:border-[#EF4444]/30"
                                : "text-[#060057]/40 dark:text-[#F6F8F1]/40 hover:text-[#060057] dark:hover:text-[#F6F8F1]"
                            }`}
                          >
                            Terkendala
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Delete Action */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      aria-label="Hapus Tugas"
                      className="p-1 text-[#060057]/25 dark:text-[#F6F8F1]/25 hover:text-[#C92121] dark:hover:text-[#EF4444] transition shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
