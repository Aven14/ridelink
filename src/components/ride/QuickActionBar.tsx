"use client";

import type { ActionType } from "@/types";
import { ACTION_CONFIG } from "@/types";

interface QuickActionBarProps {
  onAction: (type: ActionType) => void;
  sending: boolean;
}

const ACTIONS: ActionType[] = ["fuel", "photo", "break", "issue", "turnback"];

export default function QuickActionBar({ onAction, sending }: QuickActionBarProps) {
  return (
    <div
      id="quick-action-bar"
      className="flex items-center justify-around gap-2 px-2 py-3"
    >
      {ACTIONS.map((type) => {
        const cfg = ACTION_CONFIG[type];
        return (
          <button
            key={type}
            id={`action-${type}`}
            onClick={() => onAction(type)}
            disabled={sending}
            className="flex flex-col items-center gap-1 tap-target rounded-2xl px-3 transition-all duration-150 active:scale-95 disabled:opacity-50"
            style={{
              background: "var(--color-surface-700)",
              border: "1px solid rgba(255,255,255,0.06)",
              minWidth: 60,
            }}
          >
            <span className="text-2xl leading-none">{cfg.emoji}</span>
            <span
              className="text-[10px] font-semibold leading-none"
              style={{ color: "var(--color-text-muted)" }}
            >
              {type === "fuel" ? "Carbu" :
               type === "photo" ? "Photo" :
               type === "break" ? "Pause" :
               type === "issue" ? "Souci" : "Demi-tour"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
