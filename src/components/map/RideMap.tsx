"use client";

import { useEffect, useRef } from "react";
import type { MapMember } from "@/types";

// Import dynamique côté client seulement
let L: typeof import("leaflet") | null = null;

async function getLeaflet() {
  if (!L) {
    L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    if (typeof window !== "undefined") {
      // Leaflet Routing Machine s'attache à L (global)
      (window as any).L = L;
      require("leaflet-routing-machine");
      require("leaflet-routing-machine/dist/leaflet-routing-machine.css");
    }
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

      leaflet.tileLayer('https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=rp8QKM2YZAe2NlwKwghXQ4vbitONnLv348BE4ei5NQ3jizdK1w0oqtNfUuqigoTt', {
        attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 0,
        maxZoom: 22,
      }).addTo(map);

      // Contrôles de zoom en bas à droite
      leaflet.control.zoom({ position: "bottomright" }).addTo(map);

      leafletMapRef.current = map;

      // Forcer le redimensionnement après un court délai
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Centrer sur la position GPS de l'utilisateur
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 16);
          },
          (err) => {
            console.warn("Erreur GPS initiale:", err.message);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }

      // Ajout de l'itinéraire au clic sur la carte
      let routingControl: any = null;
      map.on('click', (e) => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
          if (routingControl) map.removeControl(routingControl);
          
          routingControl = (leaflet as any).Routing.control({
            waypoints: [
              leaflet.latLng(pos.coords.latitude, pos.coords.longitude),
              leaflet.latLng(e.latlng.lat, e.latlng.lng)
            ],
            routeWhileDragging: true,
            show: false, // Cache le panneau d'instructions texte pour garder l'UI clean
            addWaypoints: false,
            lineOptions: {
              styles: [{ color: '#f97316', opacity: 0.8, weight: 6 }]
            },
            createMarker: () => null, // Ne crée pas de marqueurs moches aux extrémités
          }).addTo(map);
        });
      });
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

  // Suivre la position de l'utilisateur en temps réel
  useEffect(() => {
    if (!leafletMapRef.current) return;

    getLeaflet().then((leaflet) => {
      const map = leafletMapRef.current;
      if (!map) return;

      const selfMember = members.find((m) => m.userId === currentUserId);
      if (selfMember) {
        map.panTo([selfMember.location.lat, selfMember.location.lng], { animate: true });
      }
    });
  }, [members, currentUserId]);

  // Fonction pour recentrer sur l'utilisateur
  const recenterOnSelf = () => {
    if (!leafletMapRef.current) return;

    getLeaflet().then((leaflet) => {
      const map = leafletMapRef.current;
      if (!map) return;

      const selfMember = members.find((m) => m.userId === currentUserId);
      if (selfMember) {
        map.setView([selfMember.location.lat, selfMember.location.lng], 16, { animate: true });
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 16, { animate: true });
          },
          () => {}
        );
      }
    });
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        id="RideWayv-map"
        className="w-full h-full"
        style={{ background: "#1a1a2e" }}
      />
      <button
        onClick={recenterOnSelf}
        className="absolute bottom-20 right-4 z-[2000] w-12 h-12 rounded-2xl flex items-center justify-center text-xl glass transition-all active:scale-95"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        🎯
      </button>
    </div>
  );
}
