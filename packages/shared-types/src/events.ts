// ============================================================
// StreamBattle — Supabase Realtime Broadcast Event Types
// Shared between apps/web and packages/tiktok-service
// ============================================================

export type TeamSide = "A" | "B";
export type BattleStatus = "draft" | "active" | "paused" | "ended";

export interface LastGift {
  user: string;
  giftName: string;
  giftId: number;
  team: TeamSide;
  points: number;
  diamondValue: number;
  repeatCount: number;
}

export interface ScoreUpdateEvent {
  type: "score-update";
  battleId: string;
  teamAScore: number;
  teamBScore: number;
  lastGift: LastGift;
}

export interface BattleStatusEvent {
  type: "battle-status";
  battleId: string;
  status: BattleStatus;
}

export interface ParticipantJoinedEvent {
  type: "participant-joined";
  battleId: string;
  user: string;
  team: TeamSide;
}

export type BattleRealtimeEvent =
  | ScoreUpdateEvent
  | BattleStatusEvent
  | ParticipantJoinedEvent;

// Channel naming convention
export const getBattleChannel = (battleId: string) => `battle:${battleId}`;
