import { getAdminOffices } from "@/actions/admin";
import { OfficesManagerView } from "@/components/admin/OfficesManagerView";

export default async function AdminOfficesPage() {
  const data = await getAdminOffices();

  return (
    <OfficesManagerView
      initialOffices={data.offices}
      isHrAdmin={data.isHrAdmin}
      initialError={data.error}
    />
  );
}

