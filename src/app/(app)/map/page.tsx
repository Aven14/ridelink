import { auth } from "@/lib/auth";
import MapClient from "./MapClient";

export const metadata = {
  title: "Carte – RideWayv",
  description: "Navigation GPS",
};

export default async function MapPage() {
  const session = await auth();
  if (!session) return null;

  return <MapClient userId={session.user.id} userName={session.user.name || "Rider"} />;
}
