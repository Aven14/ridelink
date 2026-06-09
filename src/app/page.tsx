import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-dvh flex flex-col" style={{ background: "var(--color-surface-900)" }}>
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="relative mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto gradient-brand shadow-lg"
            style={{ boxShadow: "0 0 40px rgba(249,115,22,0.4)" }}
          >
            🏍️
          </div>
          <h1
            className="text-5xl font-black tracking-tight"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <span className="text-gradient">Ride</span>
            <span style={{ color: "var(--color-text-primary)" }}>Wayv</span>
          </h1>
          <p
            className="mt-3 text-lg font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Roulez ensemble, en temps réel.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 max-w-sm w-full mb-10">
          {[
            { icon: "📍", title: "GPS Live", desc: "Position de tout le groupe" },
            { icon: "🎤", title: "Chat Vocal", desc: "WebRTC peer-to-peer" },
            { icon: "⛽", title: "Actions Rapides", desc: "Pause, carburant, issue" },
            { icon: "🗺️", title: "Carte Temps Réel", desc: "OpenStreetMap intégré" },
          ].map((f) => (
            <div
              key={f.title}
              className="glass rounded-xl p-4 text-left"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
                {f.title}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/register"
            id="cta-register"
            className="tap-target flex items-center justify-center rounded-xl font-bold text-base transition-all duration-200 gradient-brand text-white"
            style={{ boxShadow: "0 4px 24px rgba(249,115,22,0.35)" }}
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/login"
            id="cta-login"
            className="tap-target flex items-center justify-center rounded-xl font-semibold text-base transition-all duration-200"
            style={{
              background: "var(--color-surface-700)",
              color: "var(--color-text-secondary)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Se connecter
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-4 text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        RideWayv © 2025 · GPS gratuit · Données chiffrées
      </footer>
    </main>
  );
}
