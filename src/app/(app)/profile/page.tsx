import { auth } from "@/lib/auth";
import ProfileClient from "./ProfileClient";
import { db } from "@/lib/db";
import { rides } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { groupMembers } from "@/lib/db/schema";

export const metadata = {
  title: "Profil – RideWayv"
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return null;

  // Historique factice ou réel si on stocke les rides
  // Pour l'instant, on peut simplement afficher les infos du user
  return <ProfileClient user={session.user} />;
}
