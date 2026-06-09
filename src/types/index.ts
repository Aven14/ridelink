// Types de l'application RideWayv

export type UserRole = "leader" | "member";

export type ActionType = "fuel" | "photo" | "break" | "issue" | "turnback";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface GroupMember {
  userId: string;
  groupId: string;
  role: UserRole;
  joinedAt: Date;
  user?: UserProfile;
}

export interface LocationUpdate {
  userId: string;
  groupId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
  userName?: string;
  userImage?: string;
}

export interface QuickAction {
  id: string;
  userId: string;
  groupId: string;
  actionType: ActionType;
  createdAt: Date;
  user?: UserProfile;
}

export interface Ride {
  id: string;
  groupId: string;
  startedAt: Date;
  endedAt?: Date | null;
  distanceKm?: number | null;
  participantIds: string[];
}

export interface VoiceSignal {
  type: "offer" | "answer" | "ice-candidate";
  from: string;
  to: string;
  data: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export type ConnectionStatus = "online" | "weak" | "offline";

export interface MapMember {
  userId: string;
  userName: string;
  userImage?: string;
  role: UserRole;
  location: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    timestamp: string;
  };
  isOnline: boolean;
}

export const ACTION_CONFIG: Record<ActionType, { emoji: string; label: string; color: string }> = {
  fuel: { emoji: "⛽", label: "Arrêt carburant", color: "#f59e0b" },
  photo: { emoji: "📸", label: "Arrêt photo", color: "#3b82f6" },
  break: { emoji: "☕", label: "Pause", color: "#22c55e" },
  issue: { emoji: "🔧", label: "Problème", color: "#ef4444" },
  turnback: { emoji: "↩️", label: "Demi-tour", color: "#a855f7" },
};
