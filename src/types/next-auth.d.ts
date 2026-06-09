import type { NextAuthConfig } from "next-auth";

// Déclaration d'augmentation pour inclure l'id dans la session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
