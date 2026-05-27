import type { BattleConfig, TeamSide } from "@streambattle/shared-types";
import { getGiftDiamondValue } from "@streambattle/shared-types";
import {
  processGiftInDB,
  broadcastScoreUpdate,
  getParticipantTeam,
} from "./supabase-publisher";
import { getCachedTeam, cacheParticipant } from "./chat-processor";

interface TikTokGiftData {
  user: {
    uniqueId: string;
    nickname: string;
  };
  giftId: number;
  giftName: string;
  repeatCount: number;
  repeatEnd: boolean;
  diamondCount?: number;
}

/**
 * Process a completed gift streak from TikTok.
 * IMPORTANT: Only call this when data.repeatEnd === true
 */
export async function processGiftEvent(
  battleId: string,
  data: TikTokGiftData,
  config: BattleConfig
) {
  const tiktokUser = data.user.uniqueId;

  // Get diamond value (use TikTok's value if provided, else lookup catalogue)
  const diamondValue =
    data.diamondCount ?? getGiftDiamondValue(data.giftId);

  // Get viewer's team from cache, or fetch from DB
  let team: TeamSide | null = getCachedTeam(battleId, tiktokUser);

  if (!team) {
    // Try to fetch from DB (viewer may have registered in a previous session)
    team = await getParticipantTeam(battleId, tiktokUser);
    if (team) {
      cacheParticipant(battleId, tiktokUser, team);
    }
  }

  // Calculate points
  const basePoints = diamondValue * data.repeatCount;
  const points = team ? basePoints * config.giftMultiplier : 0;

  console.log(
    `[Gift] ${tiktokUser} sent ${data.repeatCount}x ${data.giftName} ` +
      `(${basePoints} pts) → Team ${team ?? "unregistered"}`
  );

  // Write to DB and get new scores
  const newScores = await processGiftInDB(
    battleId,
    tiktokUser,
    data.giftId,
    data.giftName,
    data.repeatCount,
    diamondValue,
    team,
    points
  );

  // Broadcast score update if viewer was on a team
  if (newScores && team) {
    await broadcastScoreUpdate(
      battleId,
      newScores.teamAScore,
      newScores.teamBScore,
      {
        user: tiktokUser,
        giftName: data.giftName,
        giftId: data.giftId,
        team,
        points,
        diamondValue,
        repeatCount: data.repeatCount,
      }
    );
  }
}
