import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { groups, groupMembers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import RideClient from "@/components/ride/RideClient";

interface Props {
  params: Promise<{ groupId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params;
  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  return { title: group ? `${group.name} – RideLink` : "RideLink" };
}

export default async function RidePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { groupId } = await params;

  // Vérifier membership
  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, session.user.id), eq(groupMembers.groupId, groupId)))
    .limit(1);

  if (!membership) notFound();

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (!group) notFound();

  // Charger tous les membres du groupe avec leurs infos
  const membersData = await db
    .select({ member: groupMembers, user: users })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId));

  const membersList = membersData.map(({ member, user }) => ({
    userId: user.id,
    userName: user.name ?? user.username ?? user.email ?? "Inconnu",
    userImage: user.image ?? undefined,
    role: member.role as "leader" | "member",
  }));

  return (
    <RideClient
      groupId={groupId}
      groupName={group.name}
      userId={session.user.id}
      role={membership.role as "leader" | "member"}
      members={membersList}
    />
  );
}
