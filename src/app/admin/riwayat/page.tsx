import { getAdminAttendanceReport } from "@/actions/admin";
import { getJakartaTodayDate } from "@/lib/date";
import { AttendanceReportView } from "@/components/admin/AttendanceReportView";

export default async function AdminReportPage() {
  const today = getJakartaTodayDate();
  const monthStart = `${today.slice(0, 7)}-01`;
  const initialData = await getAdminAttendanceReport({
    startDate: monthStart,
    endDate: today,
  });

  return (
    <AttendanceReportView
      initialData={initialData}
      defaultStartDate={monthStart}
      defaultEndDate={today}
    />
  );
}

