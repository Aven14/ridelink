"use client";

import { useEffect, useRef, useCallback } from "react";

interface GPSOptions {
  groupId: string;
  enabled: boolean;
  intervalMs?: number;
}

export function useGPS({ groupId, enabled, intervalMs = 3000 }: GPSOptions) {
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  const sendLocation = useCallback(
    async (position: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastSentRef.current < intervalMs - 500) return; // throttle
      lastSentRef.current = now;

      try {
        await fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            speed: position.coords.speed
              ? Math.round(position.coords.speed * 3.6) // m/s → km/h
              : undefined,
            heading: position.coords.heading ?? undefined,
            accuracy: position.coords.accuracy,
          }),
        });
      } catch (err) {
        console.warn("Erreur envoi GPS:", err);
      }
    },
    [groupId, intervalMs]
  );

  useEffect(() => {
    if (!enabled || !groupId) return;

    if (!navigator.geolocation) {
      console.warn("Géolocalisation non supportée.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      sendLocation,
      (err) => console.warn("GPS error:", err.message),
      {
        enableHighAccuracy: true,
        maximumAge: intervalMs,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, groupId, sendLocation, intervalMs]);
}
