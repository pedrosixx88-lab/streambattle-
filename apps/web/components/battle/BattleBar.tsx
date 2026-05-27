"use client";

import { useMemo } from "react";
import { calculateBarWidths, formatScore } from "@/lib/battle/scoring";

interface BattleBarProps {
  teamAScore: number;
  teamBScore: number;
  teamAName: string;
  teamBName: string;
  teamAColor?: string;
  teamBColor?: string;
  size?: "sm" | "md" | "lg";
  showScores?: boolean;
  className?: string;
}

export function BattleBar({
  teamAScore,
  teamBScore,
  teamAName,
  teamBName,
  teamAColor = "#FF0050",
  teamBColor = "#00B4FF",
  size = "md",
  showScores = true,
  className = "",
}: BattleBarProps) {
  const [widthA, widthB] = useMemo(
    () => calculateBarWidths(teamAScore, teamBScore),
    [teamAScore, teamBScore]
  );

  const heights = { sm: "h-3", md: "h-5", lg: "h-7" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  const scoreSizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" };

  return (
    <div className={`w-full ${className}`}>
      {/* Team labels + scores */}
      {showScores && (
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <span
              className={`font-bold uppercase tracking-wide ${textSizes[size]}`}
              style={{ color: teamAColor }}
            >
              {teamAName}
            </span>
            <span
              className={`font-black tabular-nums ${scoreSizes[size]}`}
              style={{ color: teamAColor }}
            >
              {formatScore(teamAScore)}
            </span>
          </div>

          {/* Center divider label */}
          <span className="text-text-muted text-xs font-medium px-2 pb-1">
            VS
          </span>

          <div className="flex flex-col items-end">
            <span
              className={`font-bold uppercase tracking-wide ${textSizes[size]}`}
              style={{ color: teamBColor }}
            >
              {teamBName}
            </span>
            <span
              className={`font-black tabular-nums ${scoreSizes[size]}`}
              style={{ color: teamBColor }}
            >
              {formatScore(teamBScore)}
            </span>
          </div>
        </div>
      )}

      {/* Battle bar track */}
      <div
        className={`relative flex w-full rounded-full overflow-hidden ${heights[size]}`}
        style={{
          boxShadow: `0 0 12px rgba(0,0,0,0.4),
                      inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        {/* Team A fill */}
        <div
          className="battle-bar-fill h-full relative"
          style={{
            width: `${widthA}%`,
            background: `linear-gradient(90deg, ${teamAColor}CC, ${teamAColor})`,
            boxShadow: `2px 0 8px ${teamAColor}60`,
          }}
        />

        {/* Team B fill */}
        <div
          className="battle-bar-fill h-full"
          style={{
            width: `${widthB}%`,
            background: `linear-gradient(270deg, ${teamBColor}CC, ${teamBColor})`,
            boxShadow: `-2px 0 8px ${teamBColor}60`,
          }}
        />

        {/* Center diamond divider */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))" }}
        >
          <div
            className="w-3 h-3 bg-white rotate-45"
            style={{ boxShadow: "0 0 6px rgba(0,0,0,0.5)" }}
          />
        </div>
      </div>

      {/* Percentage labels */}
      {showScores && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-text-muted tabular-nums">
            {widthA.toFixed(0)}%
          </span>
          <span className="text-xs text-text-muted tabular-nums">
            {widthB.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
