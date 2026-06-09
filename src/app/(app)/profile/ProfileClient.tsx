"use client";

import { signOut } from "next-auth/react";

export default function ProfileClient({ user }: { user: any }) {
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
        <div>
          <div className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>{user.name || "Rider"}</div>
          <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>{user.email}</div>
        </div>
      </div>

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
