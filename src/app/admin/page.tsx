import { getAdminDailyOverview } from "@/actions/admin";
import { DailyMonitorView } from "@/components/admin/DailyMonitorView";

export default async function AdminOverviewPage() {
  const initialData = await getAdminDailyOverview();

  return <DailyMonitorView initialData={initialData} />;
}

