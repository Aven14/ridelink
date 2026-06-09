import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { groups, groupMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { nanoid } from "nanoid";

const createSchema = z.object({
  name: z.string().min(2).max(80),
});

const joinSchema = z.object({
  inviteCode: z.string().length(6).toUpperCase(),
});

// GET /api/groups → Liste des groupes de l'utilisateur
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const myGroups = await db
    .select({
      group: groups,
      role: groupMembers.role,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, session.user.id));

  return NextResponse.json({ groups: myGroups });
}

// POST /api/groups → Créer un groupe
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const action = body.action;

  if (action === "create") {
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Nom invalide" }, { status: 400 });

    const inviteCode = nanoid(6).toUpperCase();

    const [group] = await db
      .insert(groups)
      .values({
        name: parsed.data.name,
        inviteCode,
        createdBy: session.user.id,
      })
      .returning();

    await db.insert(groupMembers).values({
      userId: session.user.id,
      groupId: group.id,
      role: "leader",
    });

    return NextResponse.json({ group }, { status: 201 });
  }

  if (action === "join") {
    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Code invalide (6 caractères)" }, { status: 400 });

    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.inviteCode, parsed.data.inviteCode))
      .limit(1);

    if (!group) return NextResponse.json({ error: "Code introuvable." }, { status: 404 });

    // Déjà membre ?
    const [existing] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.userId, session.user.id), eq(groupMembers.groupId, group.id)))
      .limit(1);

    if (existing) return NextResponse.json({ group });

    await db.insert(groupMembers).values({
      userId: session.user.id,
      groupId: group.id,
      role: "member",
    });

    return NextResponse.json({ group });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
