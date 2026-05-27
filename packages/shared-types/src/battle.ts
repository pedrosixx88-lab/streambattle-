// ============================================================
// StreamBattle — Battle Domain Types
// ============================================================

export type PlanType = "free" | "pro" | "business";
export type TeamSide = "A" | "B";
export type BattleStatus = "draft" | "active" | "paused" | "ended";

export interface PlanLimits {
  maxBattlesPerMonth: number | null; // null = unlimited
  maxDurationSeconds: number;
  overlayThemes: number;
  historyDays: number;
  giftMultiplier: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxBattlesPerMonth: 5,
    maxDurationSeconds: 5 * 60, // 5 minutes
    overlayThemes: 1,
    historyDays: 7,
    giftMultiplier: false,
  },
  pro: {
    maxBattlesPerMonth: null, // unlimited
    maxDurationSeconds: 60 * 60, // 60 minutes
    overlayThemes: 3,
    historyDays: 90,
    giftMultiplier: true,
  },
  business: {
    maxBattlesPerMonth: null, // unlimited
    maxDurationSeconds: 120 * 60, // 120 minutes
    overlayThemes: 999,
    historyDays: 365,
    giftMultiplier: true,
  },
};

export interface BattleConfig {
  battleId: string;
  tiktokUsername: string;
  chatCommandA: string;
  chatCommandB: string;
  giftMultiplier: number;
  teamAName: string;
  teamBName: string;
}

// TikTok gift diamond values (community-sourced)
// Key: giftId, Value: diamond value per unit
export const GIFT_DIAMOND_VALUES: Record<number, number> = {
  5655: 1,    // Rose
  6368: 5,    // TikTok
  7214: 10,   // Perfume
  6104: 15,   // Finger Heart
  5657: 20,   // Sunglasses
  7073: 29,   // Heart Me
  7655: 30,   // Makeup Kit
  6683: 49,   // Mic
  5659: 55,   // I Love You
  6070: 69,   // Corgi
  7191: 88,   // Sending Love
  5660: 99,   // Drama Queen
  7394: 100,  // Hat
  7395: 100,  // Guitar
  7192: 199,  // Sun Cream
  7263: 200,  // Motorcyle
  6535: 299,  // Paper Crane
  7353: 399,  // Concert
  5661: 499,  // Pyramid
  6684: 500,  // Sports Car
  7194: 999,  // Lion
  6536: 1000, // Interstellar
  7004: 1000, // Plane
  7195: 1999, // Rocket
  6063: 3000, // Concert
  7003: 5000, // Train
  5662: 9999, // Drama Queen Trophy
};

export function getGiftDiamondValue(giftId: number): number {
  return GIFT_DIAMOND_VALUES[giftId] ?? 1; // Default: 1 diamond for unknown gifts
}
