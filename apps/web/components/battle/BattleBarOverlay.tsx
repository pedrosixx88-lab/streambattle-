"use client";

import { useEffect, useRef, useState } from "react";
import { useBattleRealtime } from "@/hooks/useBattleRealtime";
import { BattleBar } from "./BattleBar";
import { GiftPopIn } from "./GiftPopIn";
import type { Battle } from "@/types/database";
import type { LastGift } from "@streambattle/shared-types";
import { formatDuration } from "@/lib/battle/scoring";

interface BattleBarOverlayProps {
  battle: Battle;
}

export function BattleBarOverlay({ battle }: BattleBarOverlayProps) {
  const [currentGifts, setCurrentGifts] = useState<
    (LastGift & { key: number })[]
  >([]);
  const giftKeyRef = useRef(0);

  // Calculate remaining time
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    if (!battle.started_at) return battle.duration_seconds;
    const elapsed = Math.floor(
      (Date.now() - new Date(battle.started_at).getTime()) / 1000
    );
    return Math.max(0, battle.duration_seconds - elapsed);
  });

  const { teamAScore, teamBScore, status, lastGift } = useBattleRealtime({
    battleId: battle.id,
    initialTeamAScore: battle.team_a_score,
    initialTeamBScore: battle.team_b_score,
    initialStatus: battle.status,
    onGift: (gift) => {
      const key = ++giftKeyRef.current;
      setCurrentGifts((prev) => [...prev, { ...gift, key }]);
      // Remove after 3.5 seconds (slight buffer after fade-out)
      setTimeout(() => {
        setCurrentGifts((prev) => prev.filter((g) => g.key !== key));
      }, 3500);
    },
  });

  // Countdown timer (only when active)
  useEffect(() => {
    if (status !== "active") return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const isEnded = status === "ended";
  const isPaused = status === "paused";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 p-3 pointer-events-none select-none"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Status banners */}
      {isEnded && (
        <div className="flex justify-center mb-3 pointer-events-none">
          <div
            className="px-6 py-2 rounded-lg text-white font-black text-lg uppercase tracking-widest"
            style={{
              background: "linear-gradient(135deg, #FF0050, #FF4080)",
              boxShadow: "0 4px 24px rgba(255,0,80,0.5)",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            ⚡ BATALHA ENCERRADA ⚡
          </div>
        </div>
      )}

      {isPaused && (
        <div className="flex justify-center mb-3 pointer-events-none">
          <div
            className="px-5 py-1.5 rounded-lg text-white font-bold text-base uppercase tracking-wider"
            style={{
              background: "rgba(255, 184, 0, 0.9)",
              boxShadow: "0 2px 12px rgba(255,184,0,0.4)",
            }}
          >
            ⏸ BATALHA PAUSADA
          </div>
        </div>
      )}

      {/* Gift pop-ins — stacked above the bar */}
      <div className="flex flex-col items-end gap-1 mb-2 pr-2">
        {currentGifts.slice(-4).map((gift) => (
          <GiftPopIn
            key={gift.key}
            gift={gift}
            teamAColor={battle.team_a_color}
            teamBColor={battle.team_b_color}
          />
        ))}
      </div>

      {/* Main battle bar area */}
      <div
        className="rounded-xl p-3"
        style={{
          background: "rgba(13, 13, 15, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(42, 42, 50, 0.7)",
          boxShadow: "0 -2px 32px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Timer */}
        {(status === "active" || status === "paused") && (
          <div className="flex justify-center mb-2">
            <span
              className="text-white font-black tabular-nums text-base px-3 py-0.5 rounded-full"
              style={{
                background: "rgba(42, 42, 50, 0.8)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.05em",
                color: timeRemaining < 30 ? "#FF0050" : "#F0F0F5",
              }}
            >
              ⏱ {formatDuration(timeRemaining)}
            </span>
          </div>
        )}

        <BattleBar
          teamAScore={teamAScore}
          teamBScore={teamBScore}
          teamAName={battle.team_a_name}
          teamBName={battle.team_b_name}
          teamAColor={battle.team_a_color}
          teamBColor={battle.team_b_color}
          size="lg"
          showScores={true}
        />

        {/* Winner announcement */}
        {isEnded && battle.winner_team && (
          <div className="text-center mt-2">
            {battle.winner_team === "draw" ? (
              <span className="text-text-muted font-bold text-sm">
                🤝 EMPATE!
              </span>
            ) : (
              <span
                className="font-black text-sm uppercase tracking-wide"
                style={{
                  color:
                    battle.winner_team === "A"
                      ? battle.team_a_color
                      : battle.team_b_color,
                }}
              >
                🏆{" "}
                {battle.winner_team === "A"
                  ? battle.team_a_name
                  : battle.team_b_name}{" "}
                VENCEU!
              </span>
            )}
          </div>
        )}

        {/* Last gift info (subtle, bottom) */}
        {lastGift && !isEnded && (
          <div className="flex justify-center mt-1">
            <span className="text-xs text-text-muted">
              🎁 {lastGift.user} enviou {lastGift.giftName} (+{lastGift.points}{" "}
              pts)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
