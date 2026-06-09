import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { locations, groupMembers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { pusherServer, channels, events } from "@/lib/pusher";
import { z } from "zod";

const schema = z.object({
  groupId: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  speed: z.number().optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy: z.number().optional(),
});

// POST /api/location → Mettre à jour la position GPS
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { groupId, lat, lng, speed, heading, accuracy } = parsed.data;

  // Vérifier que l'utilisateur est membre du groupe
  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, session.user.id), eq(groupMembers.groupId, groupId)))
    .limit(1);

  if (!membership) return NextResponse.json({ error: "Non membre du groupe" }, { status: 403 });

  // Sauvegarder la position
  await db.insert(locations).values({
    userId: session.user.id,
    groupId,
    lat,
    lng,
    speed,
    heading,
    accuracy,
    timestamp: new Date(),
  });

  // Broadcast via Pusher
  const payload = {
    userId: session.user.id,
    userName: session.user.name,
    userImage: session.user.image,
    groupId,
    lat,
    lng,
    speed,
    heading,
    accuracy,
    timestamp: new Date().toISOString(),
  };

  await pusherServer.trigger(channels.group(groupId), events.LOCATION_UPDATE, payload);

  return NextResponse.json({ ok: true });
}

// GET /api/location?groupId=xxx → Dernières positions du groupe
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

  // Dernière position de chaque membre
  const lastLocations = await db
    .select()
    .from(locations)
    .where(eq(locations.groupId, groupId))
    .orderBy(desc(locations.timestamp))
    .limit(50);

  return NextResponse.json({ locations: lastLocations });
}
