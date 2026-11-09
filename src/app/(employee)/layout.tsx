import { ReactNode } from "react";
import { Header } from "@/components/employee/Header";
import { BottomNav } from "@/components/employee/BottomNav";
import { getCurrentUser } from "@/actions/auth";

export default async function EmployeeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile, user } = await getCurrentUser();
  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Pegawai";

  return (
    <div className="min-h-screen bg-slate-100/70 sm:py-0">
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-sm border-x border-slate-200/70 relative">
        <Header userName={userName} />
        <main className="flex-1 flex flex-col px-4 py-4 pb-24">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
