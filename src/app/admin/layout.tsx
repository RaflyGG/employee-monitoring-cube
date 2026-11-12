import { ReactNode } from "react";
import { requireAdminContext } from "@/actions/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await requireAdminContext();

  return (
    <AdminShell userName={ctx.profile.full_name} role={ctx.profile.role}>
      {children}
    </AdminShell>
  );
}

