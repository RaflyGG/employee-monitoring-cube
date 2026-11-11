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
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
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
  const loadTasks = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setActionError(null);

    try {
      const data = await getTodayTasks();
      if (data.error) {
        setActionError(data.error);
      }
      setTasks(data.tasks);
      setHasClockedInToday(data.hasClockedInToday);
    } catch (err: any) {
      console.error("Gagal memuat tugas harian:", err);
      setActionError("Gagal memuat daftar tugas harian.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
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

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    const result = await updateTaskStatusAction(task.id, nextStatus);
    if (result.error) {
      setActionError(result.error);
      // Revert if failed
      loadTasks();
    }
  };

  // Change status to specific (e.g. BLOCKED)
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
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Aktivitas Hari Ini
          </h1>
          <p className="text-xs text-slate-500">
            Catat dan laporkan progres tugas harian Anda
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadTasks(true)}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh Data"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
          />
        </button>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-tight">{actionError}</span>
        </div>
      )}

      {/* State: User has NOT clocked in today */}
      {!isLoading && !hasClockedInToday && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Belum Clock-In Hari Ini
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
              Lakukan Clock-In terlebih dahulu di tab Absen agar tugas harian
              dapat tercatat ke sesi kehadiran Anda.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold rounded-xl transition shadow-xs"
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
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">
                  Dalam Proses
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {inProgressCount} Tugas
                </span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">
                  Selesai
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {completedCount} Tugas
                </span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">
                  Terkendala
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {blockedCount} Tugas
                </span>
              </div>
            </div>
          </div>

          {/* New Task Input Card */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
              <label
                htmlFor="new-task-desc"
                className="text-xs font-semibold text-slate-700"
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
                className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition"
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Status:
                  </span>
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as TaskStatus)
                    }
                    className="text-xs py-1 px-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none"
                  >
                    <option value="IN_PROGRESS">Dalam Proses</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="BLOCKED">Terkendala</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !taskInput.trim()}
                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
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
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-xs">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                Memuat daftar tugas...
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-xs flex flex-col items-center">
              <ListTodo className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                Belum Ada Tugas
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
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
                    className={`bg-white border rounded-2xl p-3.5 shadow-xs flex items-start justify-between gap-3 transition-all ${
                      isCompleted
                        ? "border-emerald-200/70 bg-emerald-50/20"
                        : isBlocked
                        ? "border-rose-200/70 bg-rose-50/20"
                        : "border-slate-200/80"
                    }`}
                  >
                    {/* Left: Checkbox Toggle & Description */}
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(task)}
                        aria-label="Toggle Selesai"
                        className="mt-0.5 text-slate-400 hover:text-blue-600 transition shrink-0"
                      >
                        {isCompleted ? (
                          <CheckSquare className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="flex flex-col flex-1 min-w-0">
                        <span
                          className={`text-sm leading-snug break-words ${
                            isCompleted
                              ? "line-through text-slate-400"
                              : "text-slate-800 font-medium"
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
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${
                              task.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            Proses
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(task.id, "COMPLETED")
                            }
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${
                              task.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            Selesai
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(task.id, "BLOCKED")
                            }
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${
                              task.status === "BLOCKED"
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : "text-slate-400 hover:text-slate-600"
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
                      className="p-1 text-slate-300 hover:text-rose-600 transition shrink-0"
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
