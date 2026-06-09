"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Group } from "@/types";
import Link from "next/link";

interface CreateGroupModalProps {
  onClose: () => void;
  onCreated: (group: Group) => void;
}

export function CreateGroupModal({ onClose, onCreated }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onCreated(data.group);
    } catch { setError("Erreur réseau."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm glass-strong rounded-2xl p-6 animate-slide-up"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
          🏍️ Créer un groupe
        </h2>
        {error && (
          <div className="rounded-xl px-3 py-2 mb-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            id="create-group-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Team Nord, Ride du dimanche…"
            className="tap-target rounded-xl px-4 text-sm outline-none"
            style={{
              background: "var(--color-surface-700)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--color-text-primary)",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid var(--color-brand-primary)")}
            onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
          />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 tap-target rounded-xl font-semibold text-sm"
              style={{ background: "var(--color-surface-700)", color: "var(--color-text-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Annuler
            </button>
            <button id="create-group-submit" type="submit" disabled={loading} className="flex-1 tap-target rounded-xl font-bold text-sm gradient-brand text-white disabled:opacity-50">
              {loading ? "Création…" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface JoinGroupModalProps {
  onClose: () => void;
  onJoined: (group: Group) => void;
}

export function JoinGroupModal({ onClose, onJoined }: JoinGroupModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", inviteCode: code.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onJoined(data.group);
    } catch { setError("Erreur réseau."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm glass-strong rounded-2xl p-6 animate-slide-up"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
          🔗 Rejoindre un groupe
        </h2>
        {error && (
          <div className="rounded-xl px-3 py-2 mb-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            id="join-group-code"
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE6C"
            className="tap-target rounded-xl px-4 text-center text-xl font-mono font-bold tracking-widest outline-none"
            style={{
              background: "var(--color-surface-700)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--color-brand-primary)",
              letterSpacing: "0.3em",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid var(--color-brand-primary)")}
            onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
          />
          <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
            Demande le code à ton leader de groupe
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 tap-target rounded-xl font-semibold text-sm"
              style={{ background: "var(--color-surface-700)", color: "var(--color-text-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Annuler
            </button>
            <button id="join-group-submit" type="submit" disabled={loading || code.length !== 6} className="flex-1 tap-target rounded-xl font-bold text-sm gradient-brand text-white disabled:opacity-50">
              {loading ? "Recherche…" : "Rejoindre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
