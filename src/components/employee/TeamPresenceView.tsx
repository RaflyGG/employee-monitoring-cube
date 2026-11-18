"use client";

import { useState, useTransition } from "react";
import { Search, RefreshCw, Users, CheckCircle2, UserX } from "lucide-react";
import { getTeamPresence, type TeamPresenceResult } from "@/actions/team";
import { formatDateIndo } from "@/lib/date";

type FilterTab = "ALL" | "PRESENT" | "ABSENT";

export function TeamPresenceView({
  initialData,
}: {
  initialData: TeamPresenceResult;
}) {
  const [data, setData] = useState<TeamPresenceResult>(initialData);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const fresh = await getTeamPresence();
      setData(fresh);
    });
  };

  const q = searchQuery.trim().toLowerCase();
  const filtered = data.members.filter((member) => {
    const matchesSearch =
      !q ||
      member.full_name.toLowerCase().includes(q) ||
      member.employee_id.toLowerCase().includes(q) ||
      (member.department || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === "PRESENT") return member.isPresent;
    if (activeTab === "ABSENT") return !member.isPresent;
    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header Card */}
      <section className="bg-white border border-[#060057]/10 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-black text-[#060057] tracking-tight">
              Kehadiran Tim Hari Ini
            </h1>
            <p className="text-[11px] font-medium text-[#060057]/60 mt-0.5">
              {formatDateIndo(data.date)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            aria-label="Segarkan data tim"
            className="p-2 rounded-xl border border-[#060057]/15 text-[#060057]/70 hover:bg-[#F6F8F1] disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isPending ? "animate-spin text-[#D74D0D]" : ""
              }`}
            />
          </button>
        </div>

        {/* Counter Badge */}
        <div className="mt-3.5 pt-3 border-t border-[#060057]/10 flex items-center justify-between text-xs font-bold">
          <span className="text-[#060057]/70">Rekan Masuk Kerja:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E9B501]/20 text-[#060057] font-mono border border-[#E9B501]/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              {data.presentCount} / {data.totalMembers} Pegawai
            </span>
          </span>
        </div>
      </section>

      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 text-[#060057]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama atau divisi rekan..."
          className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium bg-white border border-[#060057]/15 rounded-xl text-[#060057] placeholder:text-[#060057]/40 focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/25"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-[#060057]/10">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "ALL"
              ? "bg-[#060057] text-white shadow-xs"
              : "text-[#060057]/60 hover:text-[#060057]"
          }`}
        >
          Semua ({data.totalMembers})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("PRESENT")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "PRESENT"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-[#060057]/60 hover:text-[#060057]"
          }`}
        >
          Masuk ({data.presentCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ABSENT")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "ABSENT"
              ? "bg-[#C92121] text-white shadow-xs"
              : "text-[#060057]/60 hover:text-[#060057]"
          }`}
        >
          Belum ({Math.max(0, data.totalMembers - data.presentCount)})
        </button>
      </div>

      {data.error && (
        <div className="p-3 rounded-xl bg-[#C92121]/10 border border-[#C92121]/30 text-xs font-semibold text-[#C92121]">
          {data.error}
        </div>
      )}

      {/* Member Cards List */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#060057]/10 rounded-2xl p-8 text-center flex flex-col items-center gap-2">
            <Users className="h-7 w-7 text-[#060057]/25" />
            <p className="text-xs font-bold text-[#060057]">
              Tidak ada rekan ditemukan
            </p>
            <p className="text-[11px] text-[#060057]/50">
              Coba gunakan kata kunci pencarian yang lain.
            </p>
          </div>
        ) : (
          filtered.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-[#060057]/10 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar Initials */}
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    member.isPresent
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-[#F6F8F1] text-[#060057]/60 border border-[#060057]/15"
                  }`}
                >
                  {getInitials(member.full_name)}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#060057] truncate">
                    {member.full_name}
                  </p>
                  <p className="text-[10px] text-[#060057]/55 truncate">
                    {member.department ? member.department : "Pegawai"}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {member.isPresent ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Masuk Kerja</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F6F8F1] text-[#060057]/50 border border-[#060057]/15">
                    <UserX className="h-3 w-3" />
                    <span>Belum Hadir</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
