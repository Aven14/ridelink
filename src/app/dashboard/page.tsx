import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { groups, groupMembers, users, rides } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard – RideLink",
  description: "Gérez vos groupes de ride",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Groupes de l'utilisateur
  const myGroups = await db
    .select({ group: groups, role: groupMembers.role })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, session.user.id))
    .orderBy(desc(groups.createdAt));

  // Historique des rides
  const rideHistory = await db
    .select()
    .from(rides)
    .where(eq(rides.groupId, myGroups[0]?.group.id ?? ""))
    .orderBy(desc(rides.startedAt))
    .limit(5)
    .catch(() => []);

  return (
    <DashboardClient
      user={{
        id: session.user.id,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        email: session.user.email ?? null,
      }}
      initialGroups={myGroups.map(({ group, role }) => ({ group, role: role as "leader" | "member" }))}
      rideHistory={rideHistory}
    />
  );
}
