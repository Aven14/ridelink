"use client";

interface VoiceChatPanelProps {
  isJoined: boolean;
  isMuted: boolean;
  error: string | null;
  memberCount: number;
  onJoin: () => void;
  onLeave: () => void;
  onToggleMute: () => void;
}

export default function VoiceChatPanel({
  isJoined,
  isMuted,
  error,
  memberCount,
  onJoin,
  onLeave,
  onToggleMute,
}: VoiceChatPanelProps) {
  if (error) {
    return (
      <div
        id="voice-error"
        className="flex items-center gap-2 rounded-2xl px-3 py-2 text-xs glass"
        style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
      >
        🎤 Voix indisponible
      </div>
    );
  }

  if (!isJoined) {
    return (
      <button
        id="voice-join"
        onClick={onJoin}
        className="tap-target rounded-2xl px-4 flex items-center gap-2 font-semibold text-sm transition-all active:scale-95"
        style={{
          background: "var(--color-surface-700)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "var(--color-text-secondary)",
        }}
      >
        <span className="text-xl">🎤</span>
        <span className="hidden sm:inline">Voix</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Mute */}
      <button
        id="voice-mute"
        onClick={onToggleMute}
        className="tap-target w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-95"
        style={{
          background: isMuted ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.15)",
          border: `1px solid ${isMuted ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.3)"}`,
        }}
      >
        {isMuted ? "🔇" : "🎤"}
      </button>

      {/* Leave */}
      <button
        id="voice-leave"
        onClick={onLeave}
        className="tap-target w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-95"
        style={{
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.3)",
        }}
      >
        📵
      </button>
    </div>
  );
}
