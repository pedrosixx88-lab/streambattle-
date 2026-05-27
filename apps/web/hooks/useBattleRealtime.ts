"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  BattleRealtimeEvent,
  BattleStatus,
  LastGift,
  TeamSide,
} from "@streambattle/shared-types";

export interface BattleRealtimeState {
  teamAScore: number;
  teamBScore: number;
  status: BattleStatus;
  lastGift: LastGift | null;
  recentGifts: LastGift[];
  participantCountA: number;
  participantCountB: number;
  isConnected: boolean;
}

interface UseBattleRealtimeOptions {
  battleId: string;
  initialTeamAScore?: number;
  initialTeamBScore?: number;
  initialStatus?: BattleStatus;
  onGift?: (gift: LastGift) => void;
  onStatusChange?: (status: BattleStatus) => void;
}

const MAX_RECENT_GIFTS = 20;

export function useBattleRealtime({
  battleId,
  initialTeamAScore = 0,
  initialTeamBScore = 0,
  initialStatus = "active",
  onGift,
  onStatusChange,
}: UseBattleRealtimeOptions): BattleRealtimeState {
  const [state, setState] = useState<BattleRealtimeState>({
    teamAScore: initialTeamAScore,
    teamBScore: initialTeamBScore,
    status: initialStatus,
    lastGift: null,
    recentGifts: [],
    participantCountA: 0,
    participantCountB: 0,
    isConnected: false,
  });

  const participantsRef = useRef({ A: 0, B: 0 });

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial participant counts
    supabase
      .from("battle_participants")
      .select("team")
      .eq("battle_id", battleId)
      .then(({ data }) => {
        if (data) {
          const a = data.filter((p) => p.team === "A").length;
          const b = data.filter((p) => p.team === "B").length;
          participantsRef.current = { A: a, B: b };
          setState((prev) => ({
            ...prev,
            participantCountA: a,
            participantCountB: b,
          }));
        }
      });

    // Subscribe to battle channel broadcasts
    const channel = supabase
      .channel(`battle:${battleId}`)
      .on("broadcast", { event: "score-update" }, ({ payload }) => {
        const event = payload as BattleRealtimeEvent;
        if (event.type !== "score-update") return;

        setState((prev) => {
          const recentGifts = [
            event.lastGift,
            ...prev.recentGifts,
          ].slice(0, MAX_RECENT_GIFTS);

          return {
            ...prev,
            teamAScore: event.teamAScore,
            teamBScore: event.teamBScore,
            lastGift: event.lastGift,
            recentGifts,
          };
        });

        onGift?.(event.lastGift);
      })
      .on("broadcast", { event: "battle-status" }, ({ payload }) => {
        const event = payload as BattleRealtimeEvent;
        if (event.type !== "battle-status") return;

        setState((prev) => ({ ...prev, status: event.status }));
        onStatusChange?.(event.status);
      })
      .on("broadcast", { event: "participant-joined" }, ({ payload }) => {
        const event = payload as BattleRealtimeEvent;
        if (event.type !== "participant-joined") return;

        const team = event.team as TeamSide;
        participantsRef.current[team]++;

        setState((prev) => ({
          ...prev,
          participantCountA: participantsRef.current.A,
          participantCountB: participantsRef.current.B,
        }));
      })
      .subscribe((status) => {
        setState((prev) => ({
          ...prev,
          isConnected: status === "SUBSCRIBED",
        }));
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [battleId, onGift, onStatusChange]);

  return state;
}
