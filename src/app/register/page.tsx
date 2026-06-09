"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription.");
        setLoading(false);
        return;
      }

      // Auto-login après inscription
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push("/dashboard");
    } catch {
      setError("Erreur réseau. Réessaie.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <main
      className="min-h-dvh flex items-center justify-center px-5 py-8"
      style={{ background: "var(--color-surface-900)" }}
    >
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🏍️</span>
            <span className="text-2xl font-black">
              <span className="text-gradient">Ride</span>
              <span style={{ color: "var(--color-text-primary)" }}>Wayv</span>
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Rejoins la communauté !
          </p>
        </div>

        <div
          className="glass rounded-2xl p-6"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h1 className="text-xl font-bold mb-5" style={{ color: "var(--color-text-primary)" }}>
            Créer un compte
          </h1>

          {error && (
            <div
              className="rounded-xl px-4 py-3 mb-4 text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { name: "username", label: "Pseudo", type: "text", placeholder: "MotoKing", autocomplete: "username" },
              { name: "email", label: "Email", type: "email", placeholder: "toi@example.com", autocomplete: "email" },
              { name: "password", label: "Mot de passe", type: "password", placeholder: "••••••••", autocomplete: "new-password" },
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  {field.label}
                </label>
                <input
                  id={`register-${field.name}`}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autocomplete}
                  required
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="tap-target rounded-xl px-4 text-sm outline-none transition-all"
                  style={{
                    background: "var(--color-surface-700)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "var(--color-text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid var(--color-brand-primary)")}
                  onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
                />
              </div>
            ))}

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="tap-target rounded-xl font-bold text-base transition-all duration-200 gradient-brand text-white disabled:opacity-50"
              style={{ boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}
            >
              {loading ? "Création…" : "Créer mon compte"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          <button
            id="register-google"
            onClick={handleGoogle}
            disabled={loading}
            className="tap-target w-full rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50"
            style={{
              background: "var(--color-surface-700)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--color-text-primary)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.4 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.4 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C37 38 44 33 44 24c0-1.3-.1-2.6-.4-3.9z" />
            </svg>
            Continuer avec Google
          </button>

          <p className="text-center text-sm mt-5" style={{ color: "var(--color-text-muted)" }}>
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--color-brand-primary)" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
