import { CalendarCheck2, Clock, CheckCircle2 } from "lucide-react";

export default function RiwayatPage() {
  const dummyHistory = [
    {
      date: "Jumat, 6 November 2026",
      in: "08:15 WIB",
      out: "17:05 WIB",
      total: "8 jam 50 mnt",
      status: "Tepat Waktu",
    },
    {
      date: "Kamis, 5 November 2026",
      in: "08:28 WIB",
      out: "17:10 WIB",
      total: "8 jam 42 mnt",
      status: "Tepat Waktu",
    },
    {
      date: "Rabu, 4 November 2026",
      in: "08:45 WIB",
      out: "17:30 WIB",
      total: "8 jam 45 mnt",
      status: "Terlambat",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-base font-bold text-slate-900">Riwayat Presensi</h1>
        <p className="text-xs text-slate-500">Catatan kehadiran minggu ini</p>
      </div>

      <div className="flex flex-col gap-3">
        {dummyHistory.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {item.date}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  item.status === "Tepat Waktu"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Masuk</span>
                <span className="font-semibold text-slate-800">{item.in}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Pulang</span>
                <span className="font-semibold text-slate-800">{item.out}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Durasi</span>
                <span className="font-semibold text-blue-600">{item.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

