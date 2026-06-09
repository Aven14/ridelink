"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { LocationUpdate } from "@/types";

interface GPSOptions {
  groupId: string;
  enabled: boolean;
  intervalMs?: number;
}

export function useGPS({ groupId, enabled, intervalMs = 3000 }: GPSOptions) {
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);
  const [location, setLocation] = useState<LocationUpdate | null>(null);

  const sendLocation = useCallback(
    async (position: GeolocationPosition) => {
      const locationData: LocationUpdate = {
        userId: "", // Will be set by caller
        groupId,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        speed: position.coords.speed
          ? Math.round(position.coords.speed * 3.6) // m/s → km/h
          : undefined,
        heading: position.coords.heading ?? undefined,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
      };

      // Mettre à jour la location locale immédiatement
      setLocation(locationData);

      // Envoyer à l'API seulement si dans un groupe
      if (!groupId) return;

      // Envoyer à l'API avec throttle
      const now = Date.now();
      if (now - lastSentRef.current < intervalMs - 500) return; // throttle
      lastSentRef.current = now;

      try {
        await fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locationData),
        });
      } catch (err) {
        console.warn("Erreur envoi GPS:", err);
      }
    },
    [groupId, intervalMs]
  );

  useEffect(() => {
    if (!enabled) {
      console.log("[GPS] Disabled");
      return;
    }

    if (!navigator.geolocation) {
      console.warn("[GPS] Géolocalisation non supportée.");
      return;
    }

    console.log("[GPS] Starting watch, groupId:", groupId);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        console.log("[GPS] Position received:", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
        });
        sendLocation(position);
      },
      (err) => console.warn("[GPS] Error:", err.message),
      {
        enableHighAccuracy: true,
        maximumAge: intervalMs,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        console.log("[GPS] Stopping watch");
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, groupId, sendLocation, intervalMs]);

  return { location };
}
