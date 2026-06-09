import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(2).max(32).regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et _ uniquement"),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { username, email } = parsed.data;

    // Vérifier email existant
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }

    // Créer l'utilisateur (pour prod: hasher le mot de passe avec bcrypt)
    const [newUser] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        username,
        email,
        name: username,
      })
      .returning();

    return NextResponse.json({ user: { id: newUser.id, email: newUser.email } }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
