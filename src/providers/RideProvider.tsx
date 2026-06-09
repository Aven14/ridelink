"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGPS } from "@/hooks/useGPS";
import { useGroupLocations } from "@/hooks/useGroupLocations";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useConnectionState } from "@/hooks/useConnectionState";
import type { Group, UserRole, LocationUpdate } from "@/types";

interface RideContextValue {
  group: Group | null;
  role: UserRole | null;
  myLocation: LocationUpdate | null;
  memberLocations: Record<string, LocationUpdate>;
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

  const { location: myLocation } = useGPS(3000);
  const { locations: memberLocations, sendLocation } = useGroupLocations(group?.id, userId);
  const voiceChat = useVoiceChat(group?.id, userId, userName);
  const connectionState = useConnectionState(group?.id);

  // Synchronisation GPS vers Pusher si dans un groupe
  useEffect(() => {
    if (group && myLocation) {
      sendLocation(myLocation);
    }
  }, [group?.id, myLocation, sendLocation]);

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
      if (voiceChat.isJoined) voiceChat.leaveVoiceChat();
    } catch (err) {
      console.error("Erreur en quittant le groupe", err);
    }
  };

  // Écoute de l'événement Pusher pour destruction du groupe (si le leader quitte)
  useEffect(() => {
    if (!group) return;
    const { pusherClient } = require("@/lib/pusher-client");
    const channelName = `presence-ride-${group.id}`;
    const channel = pusherClient.channel(channelName) || pusherClient.subscribe(channelName);
    
    const handleGroupDeleted = () => {
      setGroupData(null, null);
      if (voiceChat.isJoined) voiceChat.leaveVoiceChat();
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
        memberLocations,
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
