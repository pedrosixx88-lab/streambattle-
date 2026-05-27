"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

interface Streamer {
  id: string;
  username: string;
  display_name: string | null;
  tiktok_username: string | null;
  plan: string | null;
  battles_count: number | null;
  created_at: string | null;
  onboarding_completed: boolean | null;
}

interface Props {
  streamers: Streamer[];
}

const PLAN_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
];

export function StreamerTable({ streamers }: Props) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const filtered = streamers.filter((s) => {
    const matchesPlan = planFilter === "all" || s.plan === planFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.username.toLowerCase().includes(q) ||
      (s.display_name ?? "").toLowerCase().includes(q) ||
      (s.tiktok_username ?? "").toLowerCase().includes(q);
    return matchesPlan && matchesSearch;
  });

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Filters */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome, username ou TikTok..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded text-xs text-text-primary placeholder:text-text-muted pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-red"
          />
        </div>
        <div className="flex gap-1">
          {PLAN_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPlanFilter(value)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                planFilter === value
                  ? "bg-brand-red text-white"
                  : "bg-background border border-border text-text-muted hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-text-muted ml-auto">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Usuário
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                TikTok
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Plano
              </th>
              <th className="text-right px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Batalhas
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Cadastro
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-bold text-text-muted uppercase tracking-wide">
                Onboarding
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-text-muted">
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-text-primary">
                    {s.display_name || s.username}
                  </p>
                  <p className="text-[11px] text-text-muted font-mono">{s.username}</p>
                </td>
                <td className="px-4 py-2.5">
                  {s.tiktok_username ? (
                    <Link
                      href={`https://tiktok.com/@${s.tiktok_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-blue hover:underline font-mono"
                    >
                      @{s.tiktok_username}
                    </Link>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      s.plan === "pro"
                        ? "bg-brand-blue/20 text-brand-blue"
                        : s.plan === "business"
                        ? "bg-yellow-400/20 text-yellow-400"
                        : "bg-border text-text-muted"
                    }`}
                  >
                    {(s.plan ?? "free").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-text-primary">
                  {s.battles_count ?? 0}
                </td>
                <td className="px-4 py-2.5 text-text-muted">
                  {formatDate(s.created_at)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      s.onboarding_completed
                        ? "bg-success/20 text-success"
                        : "bg-yellow-400/20 text-yellow-400"
                    }`}
                  >
                    {s.onboarding_completed ? "COMPLETO" : "PENDENTE"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
