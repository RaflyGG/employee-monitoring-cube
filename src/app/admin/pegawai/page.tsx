import { getAdminEmployeesData } from "@/actions/admin";
import { EmployeesManagerView } from "@/components/admin/EmployeesManagerView";

export default async function AdminEmployeesPage() {
  const data = await getAdminEmployeesData();

  return (
    <EmployeesManagerView
      initialEmployees={data.employees}
      initialOffices={data.offices}
      isHrAdmin={data.isHrAdmin}
      initialError={data.error}
    />
  );
}

