"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function ProfileClient({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la mise à jour");
        return;
      }

      setIsEditing(false);
      // Reload page to show updated name
      window.location.reload();
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
      <h1 className="text-3xl font-black mb-8" style={{ color: "var(--color-text-primary)" }}>Profil</h1>

      <div className="glass-strong p-6 rounded-3xl flex items-center gap-4 mb-8" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        {user.image ? (
          <img src={user.image} alt={user.name || ""} className="w-16 h-16 rounded-full object-cover shadow-lg" />
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black gradient-brand text-white shadow-lg">
            {(user.name || user.email || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton pseudo"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--color-surface-700)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--color-text-primary)",
              }}
              autoFocus
            />
          ) : (
            <div className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>{user.name || "Rider"}</div>
          )}
          <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>{user.email}</div>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={loading}
          className="tap-target rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95"
          style={{
            background: isEditing ? "var(--color-brand-primary)" : "var(--color-surface-700)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {loading ? "..." : isEditing ? "Sauvegarder" : "Modifier"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 mb-4 text-sm font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="tap-target rounded-2xl py-4 font-bold text-sm w-full transition-transform active:scale-95"
          style={{ background: "var(--color-surface-700)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-text-secondary)" }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
