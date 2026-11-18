"use client";

import { useState, useTransition } from "react";
import {
  Users,
  Search,
  Save,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X,
} from "lucide-react";
import {
  getAdminEmployeesData,
  updateEmployeeAction,
} from "@/actions/admin";
import { RoleBadge } from "@/components/admin/StatusBadges";
import type { Office, Profile, UserRole } from "@/types/database";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "EMPLOYEE", label: "Pegawai (EMPLOYEE)" },
  { value: "SUPERVISOR", label: "Supervisor (SUPERVISOR)" },
  { value: "HR_ADMIN", label: "HR Admin (HR_ADMIN)" },
];

export function EmployeesManagerView({
  initialEmployees,
  initialOffices,
  isHrAdmin,
  initialError,
}: {
  initialEmployees: Profile[];
  initialOffices: Office[];
  isHrAdmin: boolean;
  initialError?: string;
}) {
  const [employees, setEmployees] = useState<Profile[]>(initialEmployees);
  const [offices, setOffices] = useState<Office[]>(initialOffices);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDept, setDraftDept] = useState<string>("");
  const [draftOfficeId, setDraftOfficeId] = useState<string>("");
  const [draftRole, setDraftRole] = useState<UserRole>("EMPLOYEE");
  const [draftActive, setDraftActive] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(
    initialError ? { type: "error", message: initialError } : null
  );
  const [isPending, startTransition] = useTransition();

  const officeNameById = new Map<string, string>(
    offices.map((o) => [o.id, o.name])
  );

  const startEdit = (emp: Profile) => {
    setEditingId(emp.id);
    setDraftDept(emp.department || "");
    setDraftOfficeId(emp.office_id || "");
    setDraftRole(emp.role);
    setDraftActive(emp.is_active);
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateEmployeeAction({
        id,
        department: draftDept || null,
        office_id: draftOfficeId || null,
        role: draftRole,
        is_active: draftActive,
      });

      if (res.error) {
        setFeedback({ type: "error", message: res.error });
        return;
      }

      const fresh = await getAdminEmployeesData();
      setEmployees(fresh.employees);
      setOffices(fresh.offices);
      setEditingId(null);
      setFeedback({
        type: "success",
        message: "Data pegawai berhasil diperbarui.",
      });
    });
  };

  const q = searchQuery.trim().toLowerCase();
  const filtered = employees.filter(
    (emp) =>
      !q ||
      emp.full_name.toLowerCase().includes(q) ||
      emp.employee_id.toLowerCase().includes(q) ||
      (emp.department || "").toLowerCase().includes(q)
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#060057] dark:text-[#F6F8F1] tracking-tight">
            Manajemen Data Pegawai
          </h1>
          <p className="text-xs text-[#060057]/60 dark:text-[#F6F8F1]/60 mt-0.5">
            Atur departemen, penempatan kantor, role akses, dan status aktif ({employees.length} terdaftar)
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-[#060057]/40 dark:text-[#F6F8F1]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, ID, atau divisi..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white dark:bg-[#141926] border border-[#060057]/15 dark:border-white/10 rounded-xl text-[#060057] dark:text-[#F6F8F1] placeholder:text-[#060057]/40 dark:placeholder:text-[#F6F8F1]/40 focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/30"
          />
        </div>
      </div>

      {!isHrAdmin && (
        <div className="p-3.5 rounded-xl bg-[#E9B501]/20 dark:bg-[#E9B501]/15 border border-[#E9B501]/60 dark:border-[#E9B501]/40 text-xs font-semibold text-[#060057] dark:text-[#FCD34D]">
          Mode baca saja: akun Anda berstatus Supervisor. Hanya role HR Admin yang dapat mengubah data pegawai.
        </div>
      )}

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-[#C92121]/10 dark:bg-[#EF4444]/15 border-[#C92121]/30 dark:border-[#EF4444]/30 text-[#C92121] dark:text-[#EF4444]"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="bg-white dark:bg-[#141926] border border-[#060057]/10 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden transition-colors duration-150">
        {filtered.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <Users className="h-8 w-8 text-[#060057]/25 dark:text-[#F6F8F1]/25" />
            <p className="text-sm font-bold text-[#060057] dark:text-[#F6F8F1]">
              Tidak ada pegawai ditemukan
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#060057]/10 dark:divide-white/10">
            {filtered.map((emp) => {
              const isEditing = editingId === emp.id;

              return (
                <div key={emp.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[#060057] dark:text-[#F6F8F1]">
                          {emp.full_name}
                        </p>
                        <RoleBadge role={emp.role} />
                        {!emp.is_active && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C92121]/10 dark:bg-[#EF4444]/15 text-[#C92121] dark:text-[#EF4444] border border-[#C92121]/30 dark:border-[#EF4444]/30">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#060057]/60 dark:text-[#F6F8F1]/60 mt-1">
                        <span className="font-mono font-bold text-[#D74D0D] dark:text-[#FF6B2B]">
                          {emp.employee_id}
                        </span>
                        {` • Divisi: ${emp.department || "-"}`}
                        {` • Kantor: ${
                          emp.office_id
                            ? officeNameById.get(emp.office_id) || "Terpasang"
                            : "Default"
                        }`}
                      </p>
                    </div>

                    {isHrAdmin && !isEditing && (
                      <button
                        type="button"
                        onClick={() => startEdit(emp)}
                        className="self-start md:self-auto px-3 py-1.5 rounded-xl border border-[#060057]/15 dark:border-white/10 text-xs font-bold text-[#060057] dark:text-[#F6F8F1] hover:bg-[#F6F8F1] dark:hover:bg-[#1B2234] flex items-center gap-1.5 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#D74D0D] dark:text-[#FF6B2B]" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-dashed border-[#060057]/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-[11px] font-bold text-[#060057]/70 dark:text-[#F6F8F1]/70 mb-1">
                          Departemen / Divisi
                        </label>
                        <input
                          type="text"
                          value={draftDept}
                          onChange={(e) => setDraftDept(e.target.value)}
                          placeholder="Contoh: Engineering"
                          className="w-full px-3 py-2 rounded-xl bg-[#F6F8F1] dark:bg-[#0B0E17] border border-[#060057]/15 dark:border-white/10 text-xs font-semibold text-[#060057] dark:text-[#F6F8F1] focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/30"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#060057]/70 dark:text-[#F6F8F1]/70 mb-1">
                          Penempatan Kantor
                        </label>
                        <select
                          value={draftOfficeId}
                          onChange={(e) => setDraftOfficeId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F6F8F1] dark:bg-[#0B0E17] border border-[#060057]/15 dark:border-white/10 text-xs font-semibold text-[#060057] dark:text-[#F6F8F1] focus:outline-none"
                        >
                          <option value="">Default Kantor Utama</option>
                          {offices.map((office) => (
                            <option key={office.id} value={office.id}>
                              {office.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#060057]/70 dark:text-[#F6F8F1]/70 mb-1">
                          Role Akses
                        </label>
                        <select
                          value={draftRole}
                          onChange={(e) =>
                            setDraftRole(e.target.value as UserRole)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F6F8F1] dark:bg-[#0B0E17] border border-[#060057]/15 dark:border-white/10 text-xs font-semibold text-[#060057] dark:text-[#F6F8F1] focus:outline-none"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-[#060057] dark:text-[#F6F8F1] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftActive}
                            onChange={(e) => setDraftActive(e.target.checked)}
                            className="h-4 w-4 accent-[#D74D0D] dark:accent-[#FF6B2B]"
                          />
                          <span>Aktif</span>
                        </label>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSave(emp.id)}
                            disabled={isPending}
                            className="px-3 py-2 rounded-xl bg-[#060057] dark:bg-[#1B2234] border border-transparent dark:border-white/10 hover:bg-[#060057]/90 dark:hover:bg-[#232B42] disabled:opacity-50 text-white dark:text-[#F6F8F1] text-xs font-bold flex items-center gap-1.5"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>{isPending ? "..." : "Simpan"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isPending}
                            aria-label="Batal"
                            className="p-2 rounded-xl border border-[#060057]/15 dark:border-white/10 text-[#060057]/60 dark:text-[#F6F8F1]/60 hover:bg-[#F6F8F1] dark:hover:bg-[#1B2234]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

