import type { BattleConfig } from "@streambattle/shared-types";

const SERVICE_URL = process.env.TIKTOK_SERVICE_URL;
const SERVICE_SECRET = process.env.TIKTOK_SERVICE_SECRET;

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "x-service-secret": SERVICE_SECRET ?? "",
  };
}

/**
 * Tell the tiktok-service to connect to a TikTok live stream.
 */
export async function connectTikTokService(
  config: BattleConfig
): Promise<{ ok: boolean; error?: string }> {
  if (!SERVICE_URL) {
    console.warn("[TikTok Service] TIKTOK_SERVICE_URL not configured");
    return { ok: false, error: "Serviço TikTok não configurado" };
  }

  try {
    const res = await fetch(`${SERVICE_URL}/connect`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(config),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: body.error ?? `HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[TikTok Service] Connect error:", message);
    return { ok: false, error: message };
  }
}

/**
 * Tell the tiktok-service to disconnect from a battle's live stream.
 */
export async function disconnectTikTokService(
  battleId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!SERVICE_URL) {
    return { ok: true }; // Silently skip if not configured
  }

  try {
    const res = await fetch(`${SERVICE_URL}/disconnect`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ battleId }),
      signal: AbortSignal.timeout(10_000),
    });

    return { ok: res.ok };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[TikTok Service] Disconnect error:", message);
    return { ok: false, error: message };
  }
}
