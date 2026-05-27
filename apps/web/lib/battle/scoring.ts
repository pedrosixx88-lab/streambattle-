import { getGiftDiamondValue } from "@streambattle/shared-types";

/**
 * Calculate points for a gift event.
 * Points = diamondValue × repeatCount × multiplier
 */
export function calculateGiftPoints(
  giftId: number,
  repeatCount: number,
  multiplier: number = 1,
  overrideDiamondValue?: number
): number {
  const diamondValue = overrideDiamondValue ?? getGiftDiamondValue(giftId);
  return diamondValue * repeatCount * multiplier;
}

/**
 * Calculate battle bar widths as percentages.
 * Returns [widthA, widthB] where each is 0-100.
 * Defaults to 50/50 when both scores are 0.
 */
export function calculateBarWidths(
  teamAScore: number,
  teamBScore: number
): [number, number] {
  const total = teamAScore + teamBScore;
  if (total === 0) return [50, 50];
  const widthA = Math.max(5, Math.min(95, (teamAScore / total) * 100));
  return [widthA, 100 - widthA];
}

/**
 * Format a score number for display (e.g. 1500 → "1.5K")
 */
export function formatScore(score: number): string {
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
  if (score >= 1_000) return `${(score / 1_000).toFixed(1)}K`;
  return score.toString();
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
