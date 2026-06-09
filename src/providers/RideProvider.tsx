"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGPS } from "@/hooks/useGPS";
import { useGroupLocations } from "@/hooks/useGroupLocations";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useConnectionState } from "@/hooks/useConnectionState";
import type { Group, UserRole, LocationUpdate, MapMember } from "@/types";

interface RideContextValue {
  group: Group | null;
  role: UserRole | null;
  myLocation: LocationUpdate | null;
  memberLocations: MapMember[];
  voiceChat: ReturnType<typeof useVoiceChat>;
  connectionState: ReturnType<typeof useConnectionState>;
  setGroupData: (group: Group | null, role: UserRole | null) => void;
  leaveGroup: () => Promise<void>;
}

const RideContext = createContext<RideContextValue | null>(null);

export function RideProvider({
  children,
  initialGroup,
  initialRole,
  userId,
  userName,
}: {
  children: ReactNode;
  initialGroup: Group | null;
  initialRole: UserRole | null;
  userId: string;
  userName: string;
}) {
  const [group, setGroup] = useState<Group | null>(initialGroup);
  const [role, setRole] = useState<UserRole | null>(initialRole);

  const { location: myLocation } = useGPS({ groupId: group?.id || "", enabled: true, intervalMs: 3000 });
  const { mapMembers } = useGroupLocations({ groupId: group?.id || "", currentUserId: userId, members: [] });
  const voiceChat = useVoiceChat({ groupId: group?.id || "", userId, memberIds: [] });
  const connectionState = useConnectionState();

  // Synchronisation GPS vers Pusher si dans un groupe
  useEffect(() => {
    if (group && myLocation) {
      // La location est déjà envoyée automatiquement par useGPS
    }
  }, [group?.id, myLocation]);

  const setGroupData = (newGroup: Group | null, newRole: UserRole | null) => {
    setGroup(newGroup);
    setRole(newRole);
  };

  const leaveGroup = async () => {
    if (!group) return;
    try {
      if (role === "leader") {
        await fetch(`/api/groups/${group.id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/groups/${group.id}/leave`, { method: "POST" });
      }
      setGroupData(null, null);
      if (voiceChat.isJoined) voiceChat.leaveVoice();
    } catch (err) {
      console.error("Erreur en quittant le groupe", err);
    }
  };

  // Écoute de l'événement Pusher pour destruction du groupe (si le leader quitte)
  useEffect(() => {
    if (!group) return;
    const { getPusherClient } = require("@/lib/pusher");
    const pusherClient = getPusherClient();
    const channelName = `presence-ride-${group.id}`;
    const channel = pusherClient.channel(channelName) || pusherClient.subscribe(channelName);
    
    const handleGroupDeleted = () => {
      setGroupData(null, null);
      if (voiceChat.isJoined) voiceChat.leaveVoice();
      alert("Le leader a terminé le ride. Le groupe a été supprimé.");
    };

    channel.bind("group-deleted", handleGroupDeleted);
    return () => {
      channel.unbind("group-deleted", handleGroupDeleted);
    };
  }, [group?.id, voiceChat.isJoined]);

  // Si on est leader, détruire le groupe quand on quitte l'onglet (fermeture de l'app)
  useEffect(() => {
    if (group && role === "leader") {
      const handleUnload = () => {
        navigator.sendBeacon(`/api/groups/${group.id}/delete`);
      };
      window.addEventListener("beforeunload", handleUnload);
      return () => window.removeEventListener("beforeunload", handleUnload);
    }
  }, [group, role]);

  return (
    <RideContext.Provider
      value={{
        group,
        role,
        myLocation,
        memberLocations: mapMembers,
        voiceChat,
        connectionState,
        setGroupData,
        leaveGroup,
      }}
    >
      {children}
    </RideContext.Provider>
  );
}

export const useRide = () => {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error("useRide doit être utilisé dans un RideProvider");
  return ctx;
};
