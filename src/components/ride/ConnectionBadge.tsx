"use client";

import type { ConnectionStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ConnectionBadgeProps {
  status: ConnectionStatus;
  lastOnline: Date;
}

const CONFIG = {
  online: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "En ligne", dot: "#22c55e" },
  weak: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Signal faible", dot: "#f59e0b" },
  offline: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Hors ligne", dot: "#ef4444" },
};

export default function ConnectionBadge({ status, lastOnline }: ConnectionBadgeProps) {
  const cfg = CONFIG[status];

  return (
    <div
      id="connection-badge"
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold glass"
      style={{ color: cfg.color, border: `1px solid ${cfg.color}33` }}
    >
      <span
        className="relative flex h-2 w-2"
      >
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{
            background: cfg.dot,
            animation: status === "online" ? "ping 2s cubic-bezier(0,0,0.2,1) infinite" : "none",
          }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: cfg.dot }}
        />
      </span>
      {cfg.label}
      {status === "offline" && (
        <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
          · {formatDistanceToNow(lastOnline, { locale: fr, addSuffix: true })}
        </span>
      )}

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
