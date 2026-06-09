"use client";

import { useRide } from "@/providers/RideProvider";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { MapMember } from "@/types";

const RideMap = dynamic(() => import("@/components/map/RideMap"), { ssr: false });

export default function MapClient({ userId, userName }: { userId: string; userName: string }) {
  const { myLocation, memberLocations, role, group } = useRide();
  const [destination, setDestination] = useState<[number, number] | null>(null);

  // Construire la liste des membres pour la carte
  const members = useMemo(() => {
    const list: MapMember[] = [];
    
    // Soi-même
    if (myLocation) {
      list.push({
        userId,
        userName: userName || "Moi",
        role: role || "member",
        location: myLocation,
        isOnline: true,
      });
    }

    // Les autres
    Object.entries(memberLocations).forEach(([id, loc]) => {
      if (id !== userId) {
        list.push({
          userId: id,
          userName: "Rider", // À améliorer si on passe le nom dans Pusher
          role: group?.createdBy === id ? "leader" : "member",
          location: loc,
          isOnline: true,
        });
      }
    });

    return list;
  }, [myLocation, memberLocations, userId, userName, role, group]);

  return (
    <div className="w-full h-full relative">
      <RideMap 
        members={members} 
        currentUserId={userId} 
      />
      
      {/* HUD Speedometer : on s'assure d'avoir un z-index supérieur à Leaflet (qui est à 400-1000) */}
      <div className="absolute top-4 left-4 z-[2000] glass-strong p-4 rounded-3xl flex flex-col items-center shadow-lg"
           style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(15,15,20,0.6)" }}>
        <span className="text-4xl font-black" style={{ color: "var(--color-text-primary)" }}>
          {myLocation?.speed != null ? Math.round(myLocation.speed) : "—"}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: "var(--color-brand-primary)" }}>
          km/h
        </span>
      </div>

      {/* Info en haut à droite */}
      <div className="absolute top-4 right-4 z-[2000] glass-strong px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg"
           style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className={`w-2 h-2 rounded-full ${myLocation ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        <span className="text-xs font-bold text-white">GPS {myLocation ? "Actif" : "Recherche..."}</span>
      </div>
    </div>
  );
}
