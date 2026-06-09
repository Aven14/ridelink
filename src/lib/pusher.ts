import Pusher from "pusher";
import PusherJS from "pusher-js";

// Pusher serveur (API routes uniquement)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Pusher client (browser)
let pusherClient: PusherJS | null = null;

export function getPusherClient(): PusherJS {
  if (!pusherClient) {
    pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      enabledTransports: ["ws", "wss"],
    });
  }
  return pusherClient;
}

// Noms de canaux
export const channels = {
  group: (groupId: string) => `group-${groupId}`,
  voice: (groupId: string) => `voice-${groupId}`,
};

// Noms d'événements
export const events = {
  LOCATION_UPDATE: "location-update",
  QUICK_ACTION: "quick-action",
  MEMBER_JOIN: "member-join",
  MEMBER_LEAVE: "member-leave",
  VOICE_SIGNAL: "voice-signal",
  RIDE_START: "ride-start",
  RIDE_END: "ride-end",
};
