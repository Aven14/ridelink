"use client";

import { useEffect, useState, useRef } from "react";
import { getPusherClient, channels, events } from "@/lib/pusher";
import type { LocationUpdate, MapMember, UserRole } from "@/types";

interface UseGroupLocationsOptions {
  groupId: string;
  currentUserId: string;
  members: { userId: string; userName: string; userImage?: string; role: UserRole }[];
}

export function useGroupLocations({ groupId, currentUserId, members }: UseGroupLocationsOptions) {
  const [mapMembers, setMapMembers] = useState<Map<string, MapMember>>(new Map());
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!groupId) return;

    // Charger les dernières positions au montage
    fetch(`/api/location?groupId=${groupId}`)
      .then((r) => r.json())
      .then(({ locations }) => {
        if (!locations) return;
        const seen = new Set<string>();
        locations.forEach((loc: LocationUpdate & { userId: string; timestamp: string }) => {
          if (seen.has(loc.userId)) return;
          seen.add(loc.userId);
          const member = members.find((m) => m.userId === loc.userId);
          if (!member) return;
          setMapMembers((prev) => {
            const next = new Map(prev);
            next.set(loc.userId, {
              userId: loc.userId,
              userName: member.userName,
              userImage: member.userImage,
              role: member.role,
              location: {
                lat: loc.lat,
                lng: loc.lng,
                heading: loc.heading,
                speed: loc.speed,
                timestamp: loc.timestamp,
              },
              isOnline: Date.now() - new Date(loc.timestamp).getTime() < 30_000,
            });
            return next;
          });
        });
      })
      .catch(console.error);

    // S'abonner aux mises à jour Pusher
    const pusher = getPusherClient();
    const channel = pusher.subscribe(channels.group(groupId));

    channel.bind(events.LOCATION_UPDATE, (data: LocationUpdate) => {
      const member = members.find((m) => m.userId === data.userId);
      const userName = data.userName ?? member?.userName ?? "Inconnu";
      const userImage = data.userImage ?? member?.userImage;
      const role = member?.role ?? "member";

      setMapMembers((prev) => {
        const next = new Map(prev);
        next.set(data.userId, {
          userId: data.userId,
          userName,
          userImage,
          role,
          location: {
            lat: data.lat,
            lng: data.lng,
            heading: data.heading,
            speed: data.speed,
            timestamp: data.timestamp,
          },
          isOnline: true,
        });
        return next;
      });

      // Marquer offline si pas de mise à jour pendant 30s
      const existing = timeoutsRef.current.get(data.userId);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        setMapMembers((prev) => {
          const next = new Map(prev);
          const m = next.get(data.userId);
          if (m) next.set(data.userId, { ...m, isOnline: false });
          return next;
        });
      }, 30_000);
      timeoutsRef.current.set(data.userId, t);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channels.group(groupId));
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [groupId, members, currentUserId]);

  return { mapMembers: Array.from(mapMembers.values()) };
}
