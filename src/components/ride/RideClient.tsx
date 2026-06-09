"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useGPS } from "@/hooks/useGPS";
import { useGroupLocations } from "@/hooks/useGroupLocations";
import { useQuickActions } from "@/hooks/useQuickActions";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useConnectionState } from "@/hooks/useConnectionState";
import ConnectionBadge from "@/components/ride/ConnectionBadge";
import QuickActionBar from "@/components/ride/QuickActionBar";
import ActionAlert from "@/components/ride/ActionAlert";
import VoiceChatPanel from "@/components/ride/VoiceChatPanel";
import Link from "next/link";
import type { UserRole } from "@/types";

// Leaflet ne supporte pas SSR
const RideMap = dynamic(() => import("@/components/map/RideMap"), { ssr: false });

interface RideClientProps {
  groupId: string;
  groupName: string;
  userId: string;
  role: UserRole;
  members: { userId: string; userName: string; userImage?: string; role: UserRole }[];
}

export default function RideClient({
  groupId,
  groupName,
  userId,
  role,
  members,
}: RideClientProps) {
  const { status: connStatus, lastOnline } = useConnectionState();

  // GPS → envoie position toutes les 3s
  useGPS({ groupId, enabled: connStatus !== "offline" });

  // Positions temps réel du groupe
  const { mapMembers } = useGroupLocations({ groupId, currentUserId: userId, members });

  // Actions rapides
  const { recentActions, sendAction, sending } = useQuickActions(groupId);

  // Voice chat WebRTC
  const {
    isJoined: voiceJoined,
    isMuted,
    error: voiceError,
    joinVoice,
    leaveVoice,
    toggleMute,
  } = useVoiceChat({
    groupId,
    userId,
    memberIds: members.map((m) => m.userId),
  });

  const onlineCount = mapMembers.filter((m) => m.isOnline).length;

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: "var(--color-surface-900)" }}
    >
      {/* Carte plein écran */}
      <div className="flex-1 relative">
        <RideMap members={mapMembers} currentUserId={userId} />

        {/* HUD top */}
        <div className="absolute top-0 left-0 right-0 safe-top z-10 flex items-start justify-between px-4 pt-3 gap-3 pointer-events-none">
          {/* Gauche: nom groupe + retour */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            <Link
              href="/dashboard"
              id="ride-back"
              className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              ← {groupName}
            </Link>
            <div
              className="glass rounded-xl px-3 py-2 text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {onlineCount}/{members.length} en ligne
            </div>
          </div>

          {/* Droite: connexion + membres */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <ConnectionBadge status={connStatus} lastOnline={lastOnline} />
            {role === "leader" && (
              <div
                className="glass rounded-xl px-3 py-1.5 text-xs font-bold"
                style={{ color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
              >
                👑 Leader
              </div>
            )}
          </div>
        </div>

        {/* Alerte action (centre-haut) */}
        {recentActions.length > 0 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <ActionAlert actions={recentActions} />
          </div>
        )}

        {/* Bouton recenter */}
        <button
          id="ride-recenter"
          className="absolute bottom-6 right-4 z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl glass transition-all active:scale-95"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          onClick={() => {
            navigator.geolocation?.getCurrentPosition((pos) => {
              const event = new CustomEvent("recenter", {
                detail: { lat: pos.coords.latitude, lng: pos.coords.longitude },
              });
              window.dispatchEvent(event);
            });
          }}
        >
          🎯
        </button>
      </div>

      {/* Barre du bas */}
      <div
        className="glass-strong safe-bottom z-20"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2 px-3 pt-1">
          {/* Quick Actions */}
          <div className="flex-1">
            <QuickActionBar onAction={sendAction} sending={sending} />
          </div>

          {/* Voice */}
          <div className="flex-shrink-0 pb-3">
            <VoiceChatPanel
              isJoined={voiceJoined}
              isMuted={isMuted}
              error={voiceError}
              memberCount={members.length}
              onJoin={joinVoice}
              onLeave={leaveVoice}
              onToggleMute={toggleMute}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
