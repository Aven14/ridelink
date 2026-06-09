"use client";

import { useEffect, useRef } from "react";
import type { MapMember } from "@/types";

// Import dynamique côté client seulement
let L: typeof import("leaflet") | null = null;

async function getLeaflet() {
  if (!L) {
    L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
  }
  return L;
}

interface RideMapProps {
  members: MapMember[];
  currentUserId: string;
}

function createMarkerIcon(leaflet: typeof import("leaflet"), member: MapMember, isSelf: boolean) {
  const isLeader = member.role === "leader";
  const color = isSelf ? "#f97316" : isLeader ? "#fbbf24" : "#94a3b8";
  const emoji = isLeader ? "👑" : isSelf ? "🏍️" : "🏍️";
  const heading = member.location.heading ?? 0;

  const html = `
    <div style="
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      ${!member.isOnline ? `<div style="
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid rgba(148,163,184,0.4);
        background: rgba(15,15,15,0.7);
      "></div>` : `<div style="
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid ${color};
        background: rgba(15,15,15,0.85);
        box-shadow: 0 0 12px ${color}66;
      "></div>`}
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 14px solid ${color};
        transform: translate(-50%, -50%) rotate(${heading}deg) translateY(-18px);
        opacity: ${member.location.heading != null ? 1 : 0};
        transition: transform 0.3s ease;
      "></div>
      <span style="
        position: relative;
        font-size: 18px;
        line-height: 1;
        filter: ${member.isOnline ? "none" : "grayscale(1) opacity(0.5)"};
      ">${emoji}</span>
      ${isSelf && member.isOnline ? `<div style="
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid ${color};
        animation: pulse 2s ease-out infinite;
        opacity: 0.4;
      "></div>` : ""}
    </div>
    <div style="
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 10px;
      font-weight: 600;
      color: white;
      background: rgba(0,0,0,0.75);
      padding: 2px 6px;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    ">${member.userName}${member.location.speed ? ` · ${Math.round(member.location.speed)}km/h` : ""}</div>
  `;

  return leaflet.divIcon({
    html,
    className: "",
    iconSize: [44, 64],
    iconAnchor: [22, 22],
  });
}

export default function RideMap({ members, currentUserId }: RideMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const initializedRef = useRef(false);

  // Initialiser la carte
  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;
    initializedRef.current = true;

    getLeaflet().then((leaflet) => {
      if (!mapRef.current) return;

      const map = leaflet.map(mapRef.current, {
        center: [48.8566, 2.3522],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      // Contrôles de zoom en bas à droite
      leaflet.control.zoom({ position: "bottomright" }).addTo(map);

      leafletMapRef.current = map;

      // Centrer sur la position GPS de l'utilisateur
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 15);
          },
          () => {}
        );
      }
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  // Mettre à jour les marqueurs
  useEffect(() => {
    if (!leafletMapRef.current) return;

    getLeaflet().then((leaflet) => {
      const map = leafletMapRef.current;
      if (!map) return;

      const seen = new Set<string>();

      members.forEach((member) => {
        seen.add(member.userId);
        const isSelf = member.userId === currentUserId;
        const icon = createMarkerIcon(leaflet, member, isSelf);

        if (markersRef.current.has(member.userId)) {
          const marker = markersRef.current.get(member.userId)!;
          marker.setLatLng([member.location.lat, member.location.lng]);
          marker.setIcon(icon);
        } else {
          const marker = leaflet
            .marker([member.location.lat, member.location.lng], { icon })
            .addTo(map);
          markersRef.current.set(member.userId, marker);
        }

        // Auto-centrer sur soi-même
        if (isSelf) {
          map.panTo([member.location.lat, member.location.lng], { animate: true });
        }
      });

      // Supprimer les marqueurs des membres partis
      markersRef.current.forEach((marker, id) => {
        if (!seen.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });
    });
  }, [members, currentUserId]);

  return (
    <div
      ref={mapRef}
      id="RideWayv-map"
      className="w-full h-full"
      style={{ background: "#1a1a2e" }}
    />
  );
}
