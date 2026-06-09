import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSpeed(speedKmh: number | null | undefined): string {
  if (!speedKmh) return "—";
  return `${Math.round(speedKmh)} km/h`;
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
