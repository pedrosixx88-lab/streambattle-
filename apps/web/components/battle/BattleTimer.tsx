"use client";

import { useEffect, useRef, useState } from "react";
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
  // Initialize as null to avoid SSR/client hydration mismatch (Date.now() differs by ~1s)
  const [remaining, setRemaining] = useState<number | null>(null);
  // mounted flips to true after first client render, triggering the countdown effect
  const [mounted, setMounted] = useState(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Set initial value only on the client
  useEffect(() => {
    if (!startedAt) {
      setRemaining(durationSeconds);
    } else {
      const elapsed = Math.floor(
        (Date.now() - new Date(startedAt).getTime()) / 1000
      );
      setRemaining(Math.max(0, durationSeconds - elapsed));
    }
    setMounted(true);
  // Run once on mount — startedAt and durationSeconds are stable props
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Only start countdown after client has initialized remaining
    if (!mounted || status !== "active") return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        // Guard: not yet initialized
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          onExpireRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  // onExpire is stable via ref; remaining is updated via functional setter — no need in deps
  }, [mounted, status]);

  const isUrgent = remaining !== null && remaining <= 30 && remaining > 0;
  const isExpired = remaining === 0;

  // Show placeholder while client hasn't initialized yet (avoids hydration mismatch)
  if (remaining === null) {
    return (
      <span className="font-black tabular-nums text-lg text-text-primary">
        ⏱ --:--
      </span>
    );
  }

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
