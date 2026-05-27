import Link from "next/link";
import { Play, Pause, CheckCircle, FileText, Clock } from "lucide-react";
import type { Battle } from "@/types/database";
import { formatScore, formatDuration } from "@/lib/battle/scoring";

interface BattleCardProps {
  battle: Battle;
}

const statusConfig = {
  draft: { label: "Rascunho", color: "text-text-muted", bg: "bg-text-muted/10", icon: FileText },
  active: { label: "Ao vivo", color: "text-success", bg: "bg-success/10", icon: Play },
  paused: { label: "Pausada", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Pause },
  ended: { label: "Encerrada", color: "text-text-muted", bg: "bg-text-muted/10", icon: CheckCircle },
};

export function BattleCard({ battle }: BattleCardProps) {
  const config = statusConfig[battle.status];
  const StatusIcon = config.icon;

  const winner =
    battle.winner_team === "A"
      ? battle.team_a_name
      : battle.winner_team === "B"
      ? battle.team_b_name
      : battle.winner_team === "draw"
      ? "Empate"
      : null;

  return (
    <Link
      href={`/battles/${battle.id}`}
      className="block bg-surface border border-border rounded-lg p-4 hover:border-text-muted/50 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-red transition-colors line-clamp-1">
            {battle.title}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            @{battle.tiktok_username}
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Teams and scores */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold" style={{ color: battle.team_a_color }}>
          {battle.team_a_name}
        </span>
        <span className="text-text-muted font-black tabular-nums">
          {formatScore(battle.team_a_score)} × {formatScore(battle.team_b_score)}
        </span>
        <span className="font-bold" style={{ color: battle.team_b_color }}>
          {battle.team_b_name}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(battle.duration_seconds)}
        </div>
        {winner && (
          <span className="text-success font-medium">🏆 {winner}</span>
        )}
        <span>
          {new Date(battle.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      </div>
    </Link>
  );
}
