import { createClient } from "@supabase/supabase-js";
import type {
  ScoreUpdateEvent,
  BattleStatusEvent,
  ParticipantJoinedEvent,
  TeamSide,
  BattleStatus,
  LastGift,
} from "@streambattle/shared-types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Broadcast a message to a Supabase Realtime channel via HTTP.
 * The overlay HTML subscribes to this channel.
 */
async function broadcast(topic: string, event: string, payload: object) {
  const response = await fetch(
    `${SUPABASE_URL}/realtime/v1/api/broadcast`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        messages: [{ topic, event, payload }],
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`[Supabase Broadcast] Error: ${response.status} ${text}`);
  }
}

/**
 * Broadcast score update to overlay and dashboard
 */
export async function broadcastScoreUpdate(
  battleId: string,
  teamAScore: number,
  teamBScore: number,
  lastGift: LastGift
) {
  const event: ScoreUpdateEvent = {
    type: "score-update",
    battleId,
    teamAScore,
    teamBScore,
    lastGift,
  };
  await broadcast(`battle:${battleId}`, "score-update", event);
}

/**
 * Broadcast battle status change
 */
export async function broadcastBattleStatus(
  battleId: string,
  status: BattleStatus
) {
  const event: BattleStatusEvent = {
    type: "battle-status",
    battleId,
    status,
  };
  await broadcast(`battle:${battleId}`, "battle-status", event);
}

/**
 * Broadcast participant joined event
 */
export async function broadcastParticipantJoined(
  battleId: string,
  user: string,
  team: TeamSide
) {
  const event: ParticipantJoinedEvent = {
    type: "participant-joined",
    battleId,
    user,
    team,
  };
  await broadcast(`battle:${battleId}`, "participant-joined", event);
}

/**
 * Write gift event to DB and update score via RPC
 */
export async function processGiftInDB(
  battleId: string,
  tiktokUser: string,
  giftId: number,
  giftName: string,
  repeatCount: number,
  diamondValue: number,
  team: TeamSide | null,
  points: number
): Promise<{ teamAScore: number; teamBScore: number } | null> {
  // Insert gift event record
  await supabase.from("gift_events").insert({
    battle_id: battleId,
    tiktok_user: tiktokUser,
    gift_id: giftId,
    gift_name: giftName,
    repeat_count: repeatCount,
    diamond_value: diamondValue,
    team,
  });

  // Only update score if user is on a team
  if (!team || points <= 0) return null;

  const { data, error } = await supabase.rpc("add_gift_score", {
    p_battle_id: battleId,
    p_team: team,
    p_points: points,
  });

  if (error) {
    console.error(`[DB] add_gift_score error:`, error);
    return null;
  }

  return data as { teamAScore: number; teamBScore: number };
}

/**
 * Register viewer in a team via RPC
 */
export async function registerParticipantInDB(
  battleId: string,
  tiktokUser: string,
  team: TeamSide
) {
  const { error } = await supabase.rpc("register_participant", {
    p_battle_id: battleId,
    p_tiktok_user: tiktokUser,
    p_team: team,
  });

  if (error) {
    console.error(`[DB] register_participant error:`, error);
  }
}

/**
 * Get team for a viewer (cached lookup)
 */
export async function getParticipantTeam(
  battleId: string,
  tiktokUser: string
): Promise<TeamSide | null> {
  const { data } = await supabase
    .from("battle_participants")
    .select("team")
    .eq("battle_id", battleId)
    .eq("tiktok_user", tiktokUser)
    .single();

  return (data?.team as TeamSide) ?? null;
}

export { supabase };
