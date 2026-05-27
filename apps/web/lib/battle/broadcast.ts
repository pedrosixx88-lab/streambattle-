/**
 * Server-side Supabase Realtime broadcast helper.
 * Used from API routes to push status changes to the overlay/dashboard.
 */
import type { BattleStatus } from "@streambattle/shared-types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function broadcastBattleStatus(
  battleId: string,
  status: BattleStatus
) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return;

  try {
    await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            topic: `battle:${battleId}`,
            event: "battle-status",
            payload: { type: "battle-status", battleId, status },
          },
        ],
      }),
    });
  } catch (err) {
    console.error("[Broadcast] broadcastBattleStatus error:", err);
  }
}
