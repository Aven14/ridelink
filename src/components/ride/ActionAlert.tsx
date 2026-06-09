"use client";

import { useEffect, useState } from "react";
import { ACTION_CONFIG } from "@/types";
import type { QuickAction } from "@/types";

interface ActionAlertProps {
  actions: (QuickAction & { userName?: string })[];
}

export default function ActionAlert({ actions }: ActionAlertProps) {
  const latest = actions[0];

  if (!latest) return null;

  const cfg = ACTION_CONFIG[latest.actionType as keyof typeof ACTION_CONFIG];
  if (!cfg) return null;

  return (
    <div
      id="action-alert"
      className="animate-slide-up flex items-center gap-3 rounded-2xl px-4 py-3 glass-strong"
      style={{
        border: `1px solid ${cfg.color}44`,
        boxShadow: `0 4px 20px ${cfg.color}22`,
        maxWidth: 300,
      }}
    >
      <span className="text-3xl">{cfg.emoji}</span>
      <div>
        <div className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>
          {cfg.label}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          par {latest.userName ?? "un membre"}
        </div>
      </div>
    </div>
  );
}
