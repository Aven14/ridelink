"use client";

import { useEffect, useState } from "react";
import { getPusherClient, channels, events } from "@/lib/pusher";
import type { QuickAction, ActionType } from "@/types";

export function useQuickActions(groupId: string) {
  const [recentActions, setRecentActions] = useState<(QuickAction & { userName?: string; userImage?: string })[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(channels.group(groupId));

    channel.bind(events.QUICK_ACTION, (data: QuickAction & { userName?: string; userImage?: string; createdAt: string }) => {
      setRecentActions((prev) => [
        { ...data, createdAt: new Date(data.createdAt) },
        ...prev.slice(0, 9),
      ]);

      // Auto-retirer après 8s
      setTimeout(() => {
        setRecentActions((prev) => prev.filter((a) => a.id !== data.id));
      }, 8000);
    });

    return () => {
      channel.unbind(events.QUICK_ACTION);
    };
  }, [groupId]);

  async function sendAction(actionType: ActionType) {
    if (sending) return;
    setSending(true);
    try {
      await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, actionType }),
      });
    } catch (err) {
      console.error("Erreur envoi action:", err);
    } finally {
      setSending(false);
    }
  }

  return { recentActions, sendAction, sending };
}
