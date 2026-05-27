"use client";

import type { LastGift } from "@streambattle/shared-types";

interface GiftFeedProps {
  gifts: (LastGift & { key?: number })[];
  teamAColor?: string;
  teamBColor?: string;
  maxItems?: number;
}

export function GiftFeed({
  gifts,
  teamAColor = "#FF0050",
  teamBColor = "#00B4FF",
  maxItems = 10,
}: GiftFeedProps) {
  const displayed = gifts.slice(0, maxItems);

  if (displayed.length === 0) {
    return (
      <p className="text-text-muted text-xs text-center py-4">
        Nenhum presente ainda...
      </p>
    );
  }

  return (
    <div className="space-y-1.5 overflow-y-auto max-h-48">
      {displayed.map((gift, i) => {
        const color = gift.team === "A" ? teamAColor : teamBColor;
        const teamLabel = gift.team === "A" ? "A" : "B";
        return (
          <div
            key={gift.key ?? i}
            className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-surface-hover transition-colors"
          >
            <span className="text-base">🎁</span>
            <span className="font-semibold text-text-primary truncate max-w-[100px]">
              {gift.user}
            </span>
            <span className="text-text-muted">→</span>
            <span className="font-medium" style={{ color }}>
              Time {teamLabel}
            </span>
            <span className="text-text-muted truncate flex-1">{gift.giftName}</span>
            <span className="font-black tabular-nums shrink-0" style={{ color }}>
              +{gift.points}
            </span>
          </div>
        );
      })}
    </div>
  );
}
