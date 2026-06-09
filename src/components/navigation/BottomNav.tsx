"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/map", label: "Carte", icon: "🗺️" },
    { href: "/group", label: "Groupe", icon: "👥" },
    { href: "/profile", label: "Profil", icon: "👤" },
  ];

  return (
    <nav 
      className="h-16 glass-strong flex items-center justify-around px-2 z-[9999] safe-bottom flex-shrink-0"
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-all tap-target",
              isActive ? "text-[var(--color-brand-primary)]" : "text-[var(--color-text-muted)]"
            )}
          >
            <span className={cn("text-xl transition-transform", isActive && "scale-110")}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
