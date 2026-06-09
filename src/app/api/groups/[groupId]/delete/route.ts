import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { groups, groupMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";

// POST spécial pour navigator.sendBeacon (qui n'accepte que POST, GET, etc.)
export async function POST(req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { groupId } = await params;

  const member = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.user.id)),
  });

  if (!member || member.role !== "leader") {
    return NextResponse.json({ error: "Seul le leader peut supprimer le groupe" }, { status: 403 });
  }

  await pusherServer.trigger(`presence-ride-${groupId}`, "group-deleted", {});
  await db.delete(groupMembers).where(eq(groupMembers.groupId, groupId));
  await db.delete(groups).where(eq(groups.id, groupId));

  return NextResponse.json({ success: true });
}
