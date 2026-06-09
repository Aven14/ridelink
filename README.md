# RideWayv – Guide de configuration

## Prérequis

Node.js 20+, compte NeonDB, compte Pusher, compte Google Cloud

---

## 1. NeonDB (Base de données)

1. Va sur [neon.tech](https://neon.tech) → **New Project**
2. Copie la **Connection string** (pooled)
3. Colle dans `.env.local` → `DATABASE_URL=...`

## 2. Pusher (Temps réel GPS)

1. Va sur [pusher.com](https://pusher.com) → **Get started free**
2. Crée une app → Channels
3. Copie : App ID, Key, Secret, Cluster
4. Colle dans `.env.local`

## 3. Google OAuth

1. [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials** → **Create OAuth 2.0 Client ID**
3. Type : **Web application**
4. Authorized redirect URIs :
   - `http://localhost:3000/api/auth/callback/google`
   - `https://ton-app.vercel.app/api/auth/callback/google`
5. Colle Client ID et Secret dans `.env.local`

## 4. NEXTAUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Colle le résultat dans `.env.local` → `NEXTAUTH_SECRET=...`

---

## 5. Lancer le projet

```bash
# Installer les dépendances
npm install

# Générer et appliquer le schéma base de données
npm run db:generate
npm run db:migrate

# Démarrer en développement
npm run dev
```

→ Ouvre [http://localhost:3000](http://localhost:3000)

---

## 6. Déployer sur Vercel

```bash
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Déployer
vercel
```

Ajoute les variables d'environnement dans le dashboard Vercel :
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → `https://ton-app.vercel.app`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `PUSHER_APP_ID`, `PUSHER_SECRET`
- `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`

---

## Stack complète

| Rôle | Technologie | Gratuit |
|---|---|---|
| Frontend | Next.js 15 App Router + React + TypeScript | ✅ |
| Styles | TailwindCSS 4 | ✅ |
| Base de données | NeonDB (PostgreSQL serverless) | ✅ 0.5 GB |
| ORM | Drizzle ORM | ✅ |
| Auth | NextAuth.js v5 | ✅ |
| Temps réel | Pusher Channels | ✅ 200k msg/jour |
| Carte | Leaflet.js + OpenStreetMap | ✅ |
| Voix | WebRTC P2P | ✅ |
| Déploiement | Vercel | ✅ |
