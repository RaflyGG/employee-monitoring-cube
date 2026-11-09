import { CheckSquare, Plus } from "lucide-react";

export default function AktivitasPage() {
  const dummyTasks = [
    {
      id: "1",
      title: "Review PR & deploy staging",
      status: "completed",
      time: "09:30",
    },
    {
      id: "2",
      title: "Sinkronisasi skema Supabase & RLS",
      status: "in_progress",
      time: "11:00",
    },
    {
      id: "3",
      title: "Standup harian & reporting tim HR",
      status: "todo",
      time: "14:00",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900">Aktivitas Hari Ini</h1>
          <p className="text-xs text-slate-500">Daftar laporan tugas harian pegawai</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {dummyTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-start gap-3">
              <CheckSquare
                className={`h-4 w-4 mt-0.5 ${
                  task.status === "completed"
                    ? "text-emerald-600"
                    : task.status === "in_progress"
                    ? "text-blue-600"
                    : "text-slate-300"
                }`}
              />
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    task.status === "completed"
                      ? "line-through text-slate-400"
                      : "text-slate-800"
                  }`}
                >
                  {task.title}
                </span>
                <span className="text-[11px] text-slate-400">{task.time} WIB</span>
              </div>
            </div>

            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                task.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : task.status === "in_progress"
                  ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {task.status === "completed"
                ? "Selesai"
                : task.status === "in_progress"
                ? "Proses"
                : "Todo"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

