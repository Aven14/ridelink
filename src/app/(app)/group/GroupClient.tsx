"use client";

import { useRide } from "@/providers/RideProvider";
import { useState } from "react";
import { CreateGroupModal, JoinGroupModal } from "@/components/groups/GroupModals";
import { QuickActionBar } from "@/components/ride/QuickActionBar";
import { VoiceChatPanel } from "@/components/ride/VoiceChatPanel";

export default function GroupClient({ userId, userName }: { userId: string; userName: string }) {
  const { group, role, memberLocations, leaveGroup, setGroupData } = useRide();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Vue quand l'utilisateur n'est dans aucun groupe
  if (!group) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-6 gap-6 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(circle at 50% 30%, var(--color-brand-primary), transparent 70%)" }} />
        
        <div className="text-center z-10 mb-4">
          <div className="text-6xl mb-4">🏍️</div>
          <h1 className="text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>Roulez ensemble</h1>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
            Créez un groupe éphémère pour activer le GPS partagé et la radio vocale.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm z-10">
          <button 
            onClick={() => setShowCreate(true)} 
            className="tap-target rounded-2xl py-4 font-bold text-sm gradient-brand text-white shadow-lg active:scale-95 transition-transform"
            style={{ boxShadow: "0 4px 20px rgba(249,115,22,0.25)" }}
          >
            ➕ Créer un groupe
          </button>
          
          <button 
            onClick={() => setShowJoin(true)} 
            className="tap-target rounded-2xl py-4 font-semibold text-sm active:scale-95 transition-transform"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-text-secondary)" }}
          >
            🔗 Rejoindre avec un code
          </button>
        </div>

        {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={(g) => { setGroupData(g, "leader"); setShowCreate(false); }} />}
        {showJoin && <JoinGroupModal onClose={() => setShowJoin(false)} onJoined={(g) => { setGroupData(g, "member"); setShowJoin(false); }} />}
      </div>
    );
  }

  // Vue quand l'utilisateur est DANS un groupe
  const totalMembers = Object.keys(memberLocations).length + 1;

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-6 pb-24 flex flex-col gap-6">
      
      {/* En-tête du groupe */}
      <div className="glass-strong p-5 rounded-3xl flex justify-between items-center" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <h2 className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>{group.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: "rgba(249,115,22,0.2)", color: "var(--color-brand-primary)" }}>
              {role === "leader" ? "👑 Leader" : "🏍️ Membre"}
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>• {totalMembers} en ligne</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--color-text-muted)" }}>Code</div>
          <div className="font-mono text-lg font-black tracking-widest text-white">{group.inviteCode}</div>
        </div>
      </div>

      {/* Boutons d'actions rapides */}
      <section>
        <h3 className="text-xs font-bold mb-3 uppercase tracking-wider ml-1" style={{ color: "var(--color-text-muted)" }}>Signaux (Toast)</h3>
        <QuickActionBar groupId={group.id} userName={userName} />
      </section>

      {/* Interface Vocale (P2P WebRTC) */}
      <section className="flex-1 min-h-[200px]">
        <h3 className="text-xs font-bold mb-3 uppercase tracking-wider ml-1" style={{ color: "var(--color-text-muted)" }}>Radio Vocale</h3>
        <VoiceChatPanel userId={userId} userName={userName} groupId={group.id} />
      </section>

      {/* Bouton pour quitter/détruire */}
      <button 
        onClick={async () => {
          if (confirm(role === "leader" ? "Terminer le ride et détruire le groupe ?" : "Quitter ce groupe ?")) {
            await leaveGroup();
          }
        }}
        className="mt-auto tap-target rounded-2xl py-4 font-bold text-sm w-full active:scale-95 transition-transform"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
      >
        {role === "leader" ? "🛑 Terminer le groupe" : "👋 Quitter le groupe"}
      </button>

    </div>
  );
}
