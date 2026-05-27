"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/battle/scoring";

interface BattleTimerProps {
  startedAt: string | null;
  durationSeconds: number;
  status: string;
  onExpire?: () => void;
}

export function BattleTimer({
  startedAt,
  durationSeconds,
  status,
  onExpire,
}: BattleTimerProps) {
  const [remaining, setRemaining] = useState<number>(() => {
    if (!startedAt) return durationSeconds;
    const elapsed = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    );
    return Math.max(0, durationSeconds - elapsed);
  });

  useEffect(() => {
    if (status !== "active") return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, onExpire]);

  const isUrgent = remaining <= 30 && remaining > 0;
  const isExpired = remaining === 0;

  return (
    <span
      className={`font-black tabular-nums text-lg ${
        isExpired
          ? "text-destructive"
          : isUrgent
          ? "text-yellow-400 animate-pulse"
          : "text-text-primary"
      }`}
    >
      ⏱ {formatDuration(remaining)}
    </span>
  );
}
