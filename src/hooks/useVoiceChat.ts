"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getPusherClient, channels, events } from "@/lib/pusher";
import type { VoiceSignal } from "@/types";

const STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

interface UseVoiceChatOptions {
  groupId: string;
  userId: string;
  memberIds: string[];
}

export function useVoiceChat({ groupId, userId, memberIds }: UseVoiceChatOptions) {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingPeers, setSpeakingPeers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const sendSignal = useCallback(
    async (to: string, type: VoiceSignal["type"], data: unknown) => {
      await fetch("/api/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, to, type, data }),
      });
    },
    [groupId]
  );

  const createPeer = useCallback(
    (peerId: string, initiator: boolean) => {
      if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!;

      const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });

      // Ajouter tracks locaux
      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) sendSignal(peerId, "ice-candidate", candidate.toJSON());
      };

      pc.ontrack = ({ streams }) => {
        const audio = new Audio();
        audio.srcObject = streams[0];
        audio.play().catch(() => {});
        audioRef.current.set(peerId, audio);
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          peersRef.current.delete(peerId);
          audioRef.current.get(peerId)?.remove();
          audioRef.current.delete(peerId);
        }
      };

      peersRef.current.set(peerId, pc);

      if (initiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => sendSignal(peerId, "offer", pc.localDescription));
      }

      return pc;
    },
    [sendSignal]
  );

  const joinVoice = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setIsJoined(true);
      setError(null);

      // Initier connexions avec tous les membres déjà dans la room
      memberIds.filter((id) => id !== userId).forEach((peerId) => {
        createPeer(peerId, true);
      });
    } catch {
      setError("Microphone inaccessible. Vérifie les permissions.");
    }
  }, [memberIds, userId, createPeer]);

  const leaveVoice = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    audioRef.current.forEach((a) => a.remove());
    audioRef.current.clear();
    setIsJoined(false);
    setSpeakingPeers(new Set());
  }, []);

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  }, []);

  // Écouter les signaux WebRTC via Pusher
  useEffect(() => {
    if (!isJoined) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(channels.voice(groupId));

    channel.bind(events.VOICE_SIGNAL, async (signal: VoiceSignal) => {
      if (signal.to !== userId) return;

      const pc = createPeer(signal.from, false);

      if (signal.type === "offer") {
        const offer = signal.data as RTCSessionDescriptionInit;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal(signal.from, "answer", pc.localDescription);
      } else if (signal.type === "answer") {
        const answer = signal.data as RTCSessionDescriptionInit;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } else if (signal.type === "ice-candidate") {
        const candidate = signal.data as RTCIceCandidateInit;
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      channel.unbind(events.VOICE_SIGNAL);
      pusher.unsubscribe(channels.voice(groupId));
    };
  }, [isJoined, groupId, userId, createPeer, sendSignal]);

  return { isJoined, isMuted, speakingPeers, error, joinVoice, leaveVoice, toggleMute };
}
