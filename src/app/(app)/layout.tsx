import { BottomNav } from "@/components/navigation/BottomNav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { groupMembers, groups } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { RideProvider } from "@/providers/RideProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  // Récupération du groupe actif de l'utilisateur (s'il y en a un)
  const memberData = await db
    .select({ group: groups, role: groupMembers.role })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, session.user.id))
    .orderBy(desc(groupMembers.joinedAt))
    .limit(1);

  const initialGroup = memberData[0]?.group || null;
  const initialRole = (memberData[0]?.role as "leader" | "member" | null) || null;

  return (
    <RideProvider 
      initialGroup={initialGroup} 
      initialRole={initialRole} 
      userId={session.user.id} 
      userName={session.user.name || "Rider"}
    >
      <div className="flex flex-col h-dvh w-full overflow-hidden bg-surface-900 relative">
        <main className="flex-1 w-full h-full relative overflow-hidden">
          {children}
        </main>
        <BottomNav />
      </div>
    </RideProvider>
  );
}
