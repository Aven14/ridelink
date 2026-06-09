import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pusherServer, channels, events } from "@/lib/pusher";
import { z } from "zod";

const schema = z.object({
  groupId: z.string().uuid(),
  to: z.string(),
  type: z.enum(["offer", "answer", "ice-candidate"]),
  data: z.any(),
});

// POST /api/signal → Signalisation WebRTC via Pusher
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { groupId, to, type, data } = parsed.data;

  await pusherServer.trigger(channels.voice(groupId), events.VOICE_SIGNAL, {
    from: session.user.id,
    to,
    type,
    data,
  });

  return NextResponse.json({ ok: true });
}
