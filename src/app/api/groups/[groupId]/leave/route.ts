import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { groupMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { groupId } = await params;

  // Supprimer ce membre
  await db.delete(groupMembers).where(
    and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.user.id))
  );

  // Optionnel: informer via Pusher que quelqu'un a quitté (si on veut mettre à jour la liste des membres)
  // await pusherServer.trigger(`presence-ride-${groupId}`, "member-left", { userId: session.user.id });

  return NextResponse.json({ success: true });
}
