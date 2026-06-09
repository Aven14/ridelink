import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Bienvenue – RideWayv"
};

export default async function WelcomePage() {
  const session = await auth();
  if (!session) return null;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: "var(--color-surface-900)" }}>
      <div className="text-center max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-4 mx-auto gradient-brand shadow-lg"
            style={{ boxShadow: "0 0 50px rgba(249,115,22,0.4)" }}
          >
            🏍️
          </div>
          <h1 className="text-4xl font-black">
            <span className="text-gradient">Ride</span>
            <span style={{ color: "var(--color-text-primary)" }}>Wayv</span>
          </h1>
          <p className="mt-2 text-lg" style={{ color: "var(--color-text-secondary)" }}>
            Bienvenue, {session.user.name || "Rider"} !
          </p>
        </div>

        {/* Message */}
        <p className="text-base mb-8" style={{ color: "var(--color-text-muted)" }}>
          Prêt à rouler avec ton groupe ? Active ton GPS et rejoins l'aventure.
        </p>

        {/* Bouton Commencer */}
        <Link
          href="/map"
          className="tap-target inline-flex items-center justify-center w-full rounded-2xl font-bold text-lg py-4 transition-all duration-200 gradient-brand text-white"
          style={{ boxShadow: "0 8px 32px rgba(249,115,22,0.4)" }}
        >
          🚀 Commencer
        </Link>

        {/* Info GPS */}
        <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            💡 Active ton GPS pour partager ta position avec le groupe
          </p>
        </div>
      </div>
    </main>
  );
}
