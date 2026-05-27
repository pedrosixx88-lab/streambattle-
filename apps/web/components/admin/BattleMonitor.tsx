"use client";

import { useState } from "react";
import Link from "next/link";

interface Battle {
  id: string;
  title: string;
  status: string | null;
  team_a_name: string | null;
  team_b_name: string | null;
  team_a_score: number | null;
  team_b_score: number | null;
  tiktok_username: string | null;
  duration_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
  streamer_id: string | null;
}

interface Props {
  battles: Battle[];
  currentFilter: string;
}

const STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "paused", label: "Pausadas" },
  { value: "ended", label: "Encerradas" },
  { value: "draft", label: "Rascunho" },
];

function statusLabel(status: string | null) {
  switch (status) {
    case "active": return { text: "AO VIVO", cls: "bg-success/20 text-success" };
    case "paused": return { text: "PAUSADA", cls: "bg-yellow-400/20 text-yellow-400" };
    case "ended": return { text: "ENCERRADA", cls: "bg-border text-text-muted" };
    default: return { text: "RASCUNHO", cls: "bg-border text-text-muted" };
  }
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BattleMonitor({ battles, currentFilter }: Props) {
  const [statusFilter, setStatusFilter] = useState(currentFilter);

  const filtered =
    statusFilter === "all"
      ? battles
      : battles.filter((b) => b.status === statusFilter);

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Filters */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              statusFilter === value
                ? "bg-brand-red text-white"
                : "bg-background border border-border text-text-muted hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="text-[11px] text-text-muted ml-auto">
          {filtered.length} batalha{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Batalha
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                TikTok
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Status
              </th>
              <th className="text-center px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Placar
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Duração
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Início
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-text-muted">
                  Nenhuma batalha encontrada
                </td>
              </tr>
            )}
            {filtered.map((b) => {
              const { text, cls } = statusLabel(b.status);
              return (
                <tr key={b.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/battles/${b.id}`}
                      className="font-medium text-text-primary hover:text-brand-red transition-colors"
                    >
                      {b.title}
                    </Link>
                    <p className="text-[11px] text-text-muted font-mono">
                      {b.id.slice(0, 8)}…
                    </p>
                  </td>
                  <td className="px-4 py-2.5">
                    {b.tiktok_username ? (
                      <span className="font-mono text-brand-blue">
                        @{b.tiktok_username}
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>
                      {text}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="font-mono text-brand-red">
                      {b.team_a_score ?? 0}
                    </span>
                    <span className="text-text-muted mx-1">×</span>
                    <span className="font-mono text-brand-blue">
                      {b.team_b_score ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">
                    {formatDuration(b.duration_seconds)}
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">
                    {formatDate(b.started_at ?? b.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
