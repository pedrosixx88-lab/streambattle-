import "dotenv/config"; // carrega .env antes de qualquer import
import express from "express";
import type { Request, Response } from "express";
import type { BattleConfig } from "@streambattle/shared-types";
import { tikTokManager } from "./tiktok-manager";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 3001;
const SERVICE_SECRET = process.env.SERVICE_SECRET;

// ── Auth middleware ──
function requireServiceSecret(req: Request, res: Response, next: () => void) {
  const secret = req.headers["x-service-secret"];
  if (!SERVICE_SECRET || secret !== SERVICE_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ── Health check ──
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    activeConnections: tikTokManager.getActiveConnections().length,
    connections: tikTokManager.getActiveConnections(),
    uptime: process.uptime(),
  });
});

// ── Connect to TikTok Live ──
app.post(
  "/connect",
  requireServiceSecret,
  async (req: Request, res: Response) => {
    const config: BattleConfig = req.body;

    if (!config.battleId || !config.tiktokUsername) {
      res.status(400).json({ error: "battleId and tiktokUsername are required" });
      return;
    }

    try {
      await tikTokManager.connect(config);
      res.json({ ok: true, battleId: config.battleId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[API] Connect error:`, message);
      res.status(500).json({ error: message });
    }
  }
);

// ── Disconnect from TikTok Live ──
app.post(
  "/disconnect",
  requireServiceSecret,
  async (req: Request, res: Response) => {
    const { battleId } = req.body;

    if (!battleId) {
      res.status(400).json({ error: "battleId is required" });
      return;
    }

    await tikTokManager.disconnect(battleId);
    res.json({ ok: true, battleId });
  }
);

// ── Status for a specific battle ──
app.get(
  "/status/:battleId",
  requireServiceSecret,
  (req: Request, res: Response) => {
    const { battleId } = req.params;
    res.json({
      battleId,
      connected: tikTokManager.isConnected(battleId),
    });
  }
);

// ── Start server ──
app.listen(PORT, () => {
  console.log(`[TikTok Service] Running on port ${PORT}`);
  console.log(`[TikTok Service] Auth: ${SERVICE_SECRET ? "enabled" : "DISABLED (no SERVICE_SECRET)"}`);
});

process.on("SIGTERM", async () => {
  console.log("[TikTok Service] Shutting down...");
  process.exit(0);
});
