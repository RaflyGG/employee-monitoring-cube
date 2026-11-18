import { getTeamPresence } from "@/actions/team";
import { TeamPresenceView } from "@/components/employee/TeamPresenceView";

export default async function TeamPage() {
  const data = await getTeamPresence();

  return <TeamPresenceView initialData={data} />;
}
