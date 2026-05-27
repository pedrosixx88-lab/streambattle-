"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, Square, Copy, CheckCheck, ExternalLink } from "lucide-react";
import { BattleBar } from "./BattleBar";
import { BattleTimer } from "./BattleTimer";
import { GiftFeed } from "./GiftFeed";
import { useBattleRealtime } from "@/hooks/useBattleRealtime";
import type { Battle } from "@/types/database";

interface BattleControlPanelProps {
  battle: Battle;
  appUrl: string;
}

export function BattleControlPanel({ battle, appUrl }: BattleControlPanelProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentBattle, setCurrentBattle] = useState(battle);

  const { teamAScore, teamBScore, status, recentGifts, participantCountA, participantCountB } =
    useBattleRealtime({
      battleId: battle.id,
      initialTeamAScore: battle.team_a_score,
      initialTeamBScore: battle.team_b_score,
      initialStatus: battle.status,
      onStatusChange: (newStatus) => {
        setCurrentBattle((prev) => ({ ...prev, status: newStatus }));
      },
    });

  const overlayUrl = `${appUrl}/overlay/${battle.id}`;

  async function callAction(action: "start" | "pause" | "end") {
    setActionLoading(action);
    setActionError(null);
    try {
      const res = await fetch(`/api/battles/${battle.id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Erro ao executar ação.");
      } else {
        setCurrentBattle(data.battle);
        if (action === "end") {
          // Redirect to report after end
          setTimeout(() => router.push(`/battles/${battle.id}/report`), 1500);
        }
      }
    } catch {
      setActionError("Erro de conexão.");
    } finally {
      setActionLoading(null);
    }
  }

  async function copyOverlayUrl() {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("input");
      el.value = overlayUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const currentStatus = status ?? currentBattle.status;
  const isActive = currentStatus === "active";
  const isPaused = currentStatus === "paused";
  const isDraft = currentStatus === "draft";
  const isEnded = currentStatus === "ended";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              isActive
                ? "bg-success animate-pulse"
                : isPaused
                ? "bg-yellow-400"
                : isEnded
                ? "bg-text-muted"
                : "bg-border"
            }`}
          />
          <h2 className="text-lg font-bold text-text-primary">
            {currentBattle.title}
          </h2>
          <span className="text-xs text-text-muted">@{currentBattle.tiktok_username}</span>
        </div>
        {(isActive || isPaused) && (
          <BattleTimer
            startedAt={currentBattle.started_at}
            durationSeconds={currentBattle.duration_seconds}
            status={currentStatus}
          />
        )}
      </div>

      {actionError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          {actionError}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left — Battle bar */}
        <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
          <BattleBar
            teamAScore={teamAScore}
            teamBScore={teamBScore}
            teamAName={currentBattle.team_a_name}
            teamBName={currentBattle.team_b_name}
            teamAColor={currentBattle.team_a_color}
            teamBColor={currentBattle.team_b_color}
            size="lg"
            showScores={true}
          />

          {/* Participant counts */}
          <div className="flex justify-between text-xs text-text-muted border-t border-border pt-3">
            <span>
              <span
                className="font-semibold"
                style={{ color: currentBattle.team_a_color }}
              >
                {currentBattle.team_a_name}
              </span>{" "}
              ({participantCountA} viewers)
            </span>
            <span>
              ({participantCountB} viewers){" "}
              <span
                className="font-semibold"
                style={{ color: currentBattle.team_b_color }}
              >
                {currentBattle.team_b_name}
              </span>
            </span>
          </div>
        </div>

        {/* Right — Controls */}
        <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
          {/* Action buttons */}
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              Controles
            </p>
            <div className="flex flex-wrap gap-2">
              {(isDraft || isPaused) && (
                <button
                  onClick={() => callAction("start")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-success hover:bg-success/90 text-white font-semibold text-sm rounded-md transition-colors disabled:opacity-60"
                >
                  <Play className="w-4 h-4" />
                  {actionLoading === "start" ? "Iniciando..." : "Iniciar"}
                </button>
              )}
              {isActive && (
                <button
                  onClick={() => callAction("pause")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-500/90 text-white font-semibold text-sm rounded-md transition-colors disabled:opacity-60"
                >
                  <Pause className="w-4 h-4" />
                  {actionLoading === "pause" ? "Pausando..." : "Pausar"}
                </button>
              )}
              {(isActive || isPaused) && (
                <button
                  onClick={() => callAction("end")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 text-white font-semibold text-sm rounded-md transition-colors disabled:opacity-60"
                >
                  <Square className="w-4 h-4" />
                  {actionLoading === "end" ? "Encerrando..." : "Encerrar"}
                </button>
              )}
              {isEnded && (
                <span className="text-sm text-text-muted">
                  Batalha encerrada
                </span>
              )}
            </div>
          </div>

          {/* Overlay URL */}
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
              URL do Overlay OBS
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={overlayUrl}
                className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-text-muted text-xs font-mono truncate focus:outline-none"
              />
              <button
                onClick={copyOverlayUrl}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  copied
                    ? "bg-success/10 border-success/20 text-success"
                    : "bg-surface border-border text-text-muted hover:text-text-primary hover:border-text-muted/50"
                }`}
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar
                  </>
                )}
              </button>
              <a
                href={overlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-2 py-1.5 bg-surface border border-border text-text-muted hover:text-text-primary rounded-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Adicione como Browser Source no OBS (1280×160px)
            </p>
          </div>

          {/* Punishment */}
          {currentBattle.punishment && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                Punição
              </p>
              <p className="text-sm text-text-primary">{currentBattle.punishment}</p>
            </div>
          )}
        </div>
      </div>

      {/* Gift feed */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
          Últimos presentes
        </p>
        <GiftFeed
          gifts={recentGifts}
          teamAColor={currentBattle.team_a_color}
          teamBColor={currentBattle.team_b_color}
        />
      </div>
    </div>
  );
}
