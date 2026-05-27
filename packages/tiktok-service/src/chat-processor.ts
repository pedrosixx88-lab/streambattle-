import type { BattleConfig, TeamSide } from "@streambattle/shared-types";
import {
  registerParticipantInDB,
  broadcastParticipantJoined,
} from "./supabase-publisher";

// In-memory cache of registered participants per battle
// Key: `${battleId}:${tiktokUser}` → team
const participantCache = new Map<string, TeamSide>();

export function getCachedTeam(
  battleId: string,
  tiktokUser: string
): TeamSide | null {
  return participantCache.get(`${battleId}:${tiktokUser}`) ?? null;
}

export function cacheParticipant(
  battleId: string,
  tiktokUser: string,
  team: TeamSide
) {
  participantCache.set(`${battleId}:${tiktokUser}`, team);
}

export function clearBattleCache(battleId: string) {
  for (const key of participantCache.keys()) {
    if (key.startsWith(`${battleId}:`)) {
      participantCache.delete(key);
    }
  }
}

/**
 * Process a chat message event from TikTok.
 * If the message matches a team command and the user isn't registered yet,
 * registers them in that team.
 */
export async function processChatEvent(
  battleId: string,
  tiktokUser: string,
  comment: string,
  config: BattleConfig
) {
  const trimmed = comment.trim().toLowerCase();

  // Check if user already registered
  const existingTeam = getCachedTeam(battleId, tiktokUser);
  if (existingTeam) return; // First registration wins

  let team: TeamSide | null = null;

  if (trimmed === config.chatCommandA.toLowerCase()) {
    team = "A";
  } else if (trimmed === config.chatCommandB.toLowerCase()) {
    team = "B";
  }

  if (!team) return;

  console.log(
    `[Chat] ${tiktokUser} joined Team ${team} in battle ${battleId}`
  );

  // Cache immediately to prevent duplicate registrations
  cacheParticipant(battleId, tiktokUser, team);

  // Register in DB (fire and forget)
  await registerParticipantInDB(battleId, tiktokUser, team);

  // Broadcast to overlay/dashboard
  await broadcastParticipantJoined(battleId, tiktokUser, team);
}
