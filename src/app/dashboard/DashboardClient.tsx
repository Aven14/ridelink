"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { CreateGroupModal, JoinGroupModal } from "@/components/groups/GroupModals";
import type { Group, UserRole } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface GroupWithRole { group: Group; role: UserRole }

interface DashboardClientProps {
  user: { id: string; name: string | null; image: string | null; email: string | null };
  initialGroups: GroupWithRole[];
  rideHistory: { id: string; groupId: string; startedAt: Date; endedAt?: Date | null; distanceKm?: number | null }[];
}

export default function DashboardClient({ user, initialGroups, rideHistory }: DashboardClientProps) {
  const [groups, setGroups] = useState<GroupWithRole[]>(initialGroups);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function handleCreated(group: Group) {
    setGroups((g) => [{ group, role: "leader" }, ...g]);
    setShowCreate(false);
  }

  function handleJoined(group: Group) {
    setGroups((g) => {
      if (g.find((x) => x.group.id === group.id)) return g;
      return [{ group, role: "member" }, ...g];
    });
    setShowJoin(false);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <main
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-surface-900)" }}
    >
      {/* Header */}
      <header
        className="glass-strong safe-top px-4 pb-4 pt-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.image ? (
              <img src={user.image} alt={user.name ?? ""} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold gradient-brand"
              >
                {(user.name ?? user.email ?? "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>
                Salut, {user.name ?? "Rider"} 👋
              </div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {user.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl">🏍️</Link>
            <button
              id="signout-btn"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs px-3 py-2 rounded-xl"
              style={{ background: "var(--color-surface-700)", color: "var(--color-text-muted)" }}
            >
              Déco
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6 max-w-lg mx-auto w-full">

        {/* Boutons d'action */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-create-group"
            onClick={() => setShowCreate(true)}
            className="tap-target rounded-2xl flex flex-col items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95 gradient-brand text-white"
            style={{ boxShadow: "0 4px 20px rgba(249,115,22,0.25)", minHeight: 72 }}
          >
            <span className="text-2xl">➕</span>
            Créer un groupe
          </button>
          <button
            id="btn-join-group"
            onClick={() => setShowJoin(true)}
            className="tap-target rounded-2xl flex flex-col items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "var(--color-surface-700)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--color-text-secondary)",
              minHeight: 72,
            }}
          >
            <span className="text-2xl">🔗</span>
            Rejoindre
          </button>
        </div>

        {/* Mes groupes */}
        <section>
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Mes groupes ({groups.length})
          </h2>

          {groups.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "var(--color-surface-800)", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div className="text-4xl mb-3">🏍️</div>
              <div className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Aucun groupe pour l&apos;instant
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                Crée ou rejoins un groupe pour rouler ensemble
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {groups.map(({ group, role }) => (
                <div
                  key={group.id}
                  className="rounded-2xl p-4 flex items-center gap-4 transition-all"
                  style={{
                    background: "var(--color-surface-800)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Icône rôle */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: role === "leader" ? "rgba(251,191,36,0.12)" : "rgba(249,115,22,0.08)",
                      border: `1px solid ${role === "leader" ? "rgba(251,191,36,0.25)" : "rgba(249,115,22,0.15)"}`,
                    }}
                  >
                    {role === "leader" ? "👑" : "🏍️"}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: "var(--color-text-primary)" }}>
                      {group.name}
                    </div>
                    <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                      <span>{role === "leader" ? "Leader" : "Membre"}</span>
                      <span>·</span>
                      <button
                        onClick={() => copyCode(group.inviteCode)}
                        className="font-mono font-bold transition-all"
                        style={{ color: copiedCode === group.inviteCode ? "#22c55e" : "var(--color-brand-primary)" }}
                      >
                        {copiedCode === group.inviteCode ? "✓ Copié !" : group.inviteCode}
                      </button>
                    </div>
                  </div>

                  {/* Bouton ride */}
                  <Link
                    href={`/ride/${group.id}`}
                    id={`ride-btn-${group.id}`}
                    className="tap-target px-4 rounded-xl font-bold text-sm flex items-center gap-1.5 gradient-brand text-white flex-shrink-0"
                    style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.3)" }}
                  >
                    🚀 Rider
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Historique rides */}
        {rideHistory.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Rides récents
            </h2>
            <div className="flex flex-col gap-2">
              {rideHistory.map((ride) => (
                <div
                  key={ride.id}
                  className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: "var(--color-surface-800)", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {ride.endedAt ? "Ride terminé" : "En cours…"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {formatDistanceToNow(new Date(ride.startedAt), { locale: fr, addSuffix: true })}
                    </div>
                  </div>
                  {ride.distanceKm && (
                    <div className="text-sm font-bold" style={{ color: "var(--color-brand-primary)" }}>
                      {ride.distanceKm.toFixed(1)} km
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modales */}
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {showJoin && <JoinGroupModal onClose={() => setShowJoin(false)} onJoined={handleJoined} />}
    </main>
  );
}
