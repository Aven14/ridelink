import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quickActions, groupMembers, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { pusherServer, channels, events } from "@/lib/pusher";
import { z } from "zod";

const schema = z.object({
  groupId: z.string().uuid(),
  actionType: z.enum(["fuel", "photo", "break", "issue", "turnback"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { groupId, actionType } = parsed.data;

  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, session.user.id), eq(groupMembers.groupId, groupId)))
    .limit(1);

  if (!membership) return NextResponse.json({ error: "Non membre" }, { status: 403 });

  const [action] = await db
    .insert(quickActions)
    .values({ userId: session.user.id, groupId, actionType })
    .returning();

  await pusherServer.trigger(channels.group(groupId), events.QUICK_ACTION, {
    ...action,
    userName: session.user.name,
    userImage: session.user.image,
    createdAt: action.createdAt.toISOString(),
  });

  return NextResponse.json({ action }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  if (!groupId) return NextResponse.json({ error: "groupId manquant" }, { status: 400 });

  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, session.user.id), eq(groupMembers.groupId, groupId)))
    .limit(1);

  if (!membership) return NextResponse.json({ error: "Non membre" }, { status: 403 });

  const actions = await db
    .select({ action: quickActions, user: users })
    .from(quickActions)
    .innerJoin(users, eq(users.id, quickActions.userId))
    .where(eq(quickActions.groupId, groupId))
    .orderBy(desc(quickActions.createdAt))
    .limit(20);

  return NextResponse.json({ actions });
}
