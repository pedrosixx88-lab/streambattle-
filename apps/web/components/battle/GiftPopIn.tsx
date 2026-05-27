"use client";

import { useEffect, useState } from "react";
import type { LastGift } from "@streambattle/shared-types";

interface GiftPopInProps {
  gift: LastGift;
  teamAColor?: string;
  teamBColor?: string;
}

export function GiftPopIn({
  gift,
  teamAColor = "#FF0050",
  teamBColor = "#00B4FF",
}: GiftPopInProps) {
  const [visible, setVisible] = useState(true);
  const color = gift.team === "A" ? teamAColor : teamBColor;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="animate-gift-pop-in pointer-events-none"
      style={{ color }}
    >
      <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm font-medium shadow-lg">
        <span className="text-base">🎁</span>
        <span className="text-white/90 font-semibold">{gift.user}</span>
        <span className="text-text-muted">→</span>
        <span style={{ color }}>{gift.giftName}</span>
        <span className="text-xs font-bold" style={{ color }}>
          +{gift.points} pts
        </span>
      </div>
    </div>
  );
}
