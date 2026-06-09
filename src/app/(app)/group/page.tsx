import { auth } from "@/lib/auth";
import GroupClient from "./GroupClient";

export const metadata = {
  title: "Groupe & Voix – RideWayv"
};

export default async function GroupPage() {
  const session = await auth();
  if (!session) return null;

  return <GroupClient userId={session.user.id} userName={session.user.name || "Rider"} />;
}
