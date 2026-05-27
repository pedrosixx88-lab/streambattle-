import type { BattleConfig } from "@streambattle/shared-types";
import { broadcastBattleStatus } from "./supabase-publisher";
import { processChatEvent, clearBattleCache } from "./chat-processor";
import { processGiftEvent } from "./gift-processor";

// Dynamic import for tiktok-live-connector (CommonJS package)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { WebcastPushConnection } = require("tiktok-live-connector");

interface ActiveConnection {
  connection: ReturnType<typeof WebcastPushConnection>;
  config: BattleConfig;
  connectedAt: Date;
}

class TikTokManager {
  private connections = new Map<string, ActiveConnection>();

  /**
   * Connect to a TikTok live stream for a battle
   */
  async connect(config: BattleConfig): Promise<void> {
    const { battleId, tiktokUsername } = config;

    // Disconnect existing connection for this battle if any
    if (this.connections.has(battleId)) {
      await this.disconnect(battleId);
    }

    console.log(
      `[TikTok] Connecting to @${tiktokUsername} for battle ${battleId}`
    );

    const connection = new WebcastPushConnection(tiktokUsername, {
      processInitialData: false,
      enableWebsocketUpgrade: true,
      requestPollingIntervalMs: 2000,
    });

    // ── Gift events ──
    connection.on("gift", async (data: any) => {
      // Only process when streak is complete (viewer released button)
      if (data.repeatEnd || data.repeatCount === 1) {
        try {
          await processGiftEvent(battleId, data, config);
        } catch (err) {
          console.error(`[Gift] Processing error:`, err);
        }
      }
    });

    // ── Chat events ──
    connection.on("chat", async (data: any) => {
      try {
        await processChatEvent(
          battleId,
          data.user?.uniqueId ?? "unknown",
          data.comment ?? "",
          config
        );
      } catch (err) {
        console.error(`[Chat] Processing error:`, err);
      }
    });

    // ── Connection events ──
    connection.on("connected", (state: any) => {
      console.log(
        `[TikTok] Connected to @${tiktokUsername} (roomId: ${state.roomId})`
      );
    });

    connection.on("disconnected", async () => {
      console.warn(
        `[TikTok] Disconnected from @${tiktokUsername} (battle ${battleId})`
      );
      try {
        await broadcastBattleStatus(battleId, "paused");
      } catch (err) {
        console.error(`[Broadcast] Disconnect status error:`, err);
      }
    });

    connection.on("error", (err: Error) => {
      console.error(`[TikTok] Error for @${tiktokUsername}:`, err.message);
    });

    // Attempt connection
    try {
      await connection.connect();
      this.connections.set(battleId, {
        connection,
        config,
        connectedAt: new Date(),
      });
      console.log(
        `[TikTok] Battle ${battleId} is now live with @${tiktokUsername}`
      );
    } catch (err) {
      console.error(
        `[TikTok] Failed to connect to @${tiktokUsername}:`,
        err
      );
      throw err;
    }
  }

  /**
   * Disconnect from a TikTok live stream
   */
  async disconnect(battleId: string): Promise<void> {
    const active = this.connections.get(battleId);
    if (!active) {
      console.warn(`[TikTok] No connection found for battle ${battleId}`);
      return;
    }

    try {
      active.connection.disconnect();
    } catch (err) {
      console.error(`[TikTok] Disconnect error for battle ${battleId}:`, err);
    }

    this.connections.delete(battleId);
    clearBattleCache(battleId);
    console.log(`[TikTok] Disconnected from battle ${battleId}`);
  }

  /**
   * Get list of active connections
   */
  getActiveConnections(): { battleId: string; tiktokUsername: string; connectedAt: Date }[] {
    return Array.from(this.connections.entries()).map(([battleId, active]) => ({
      battleId,
      tiktokUsername: active.config.tiktokUsername,
      connectedAt: active.connectedAt,
    }));
  }

  /**
   * Check if a battle has an active connection
   */
  isConnected(battleId: string): boolean {
    return this.connections.has(battleId);
  }
}

// Singleton instance
export const tikTokManager = new TikTokManager();
