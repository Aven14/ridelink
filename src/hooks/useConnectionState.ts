"use client";

import { useEffect, useState } from "react";
import type { ConnectionStatus } from "@/types";

export function useConnectionState() {
  const [status, setStatus] = useState<ConnectionStatus>("online");
  const [lastOnline, setLastOnline] = useState<Date>(new Date());

  useEffect(() => {
    function handleOnline() {
      setStatus("online");
      setLastOnline(new Date());
    }
    function handleOffline() {
      setStatus("offline");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial
    if (!navigator.onLine) setStatus("offline");

    // Ping toutes les 10s pour détecter connexion faible
    const interval = setInterval(async () => {
      if (!navigator.onLine) {
        setStatus("offline");
        return;
      }
      const start = Date.now();
      try {
        await fetch("/api/ping", { cache: "no-store" });
        const ms = Date.now() - start;
        setLastOnline(new Date());
        setStatus(ms > 2000 ? "weak" : "online");
      } catch {
        setStatus("weak");
      }
    }, 10_000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { status, lastOnline };
}
