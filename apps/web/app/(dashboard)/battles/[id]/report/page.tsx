import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import type { Battle } from "@/types/database";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatScore } from "@/lib/battle/scoring";
import { BattleScoreChart } from "@/components/battle/BattleScoreChart";

type Params = { params: Promise<{ id: string }> };

export default async function BattleReportPage({ params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rawBattle } = await supabase
    .from("battles")
    .select("*")
    .eq("id", id)
    .eq("streamer_id", user.id)
    .single();

  const battle = rawBattle as Battle | null;

  if (!battle) notFound();

  if (battle.status !== "ended") {
    redirect(`/battles/${id}`);
  }

  // Get stats via RPC
  const { data: statsRaw } = await supabase.rpc("get_battle_stats", {
    p_battle_id: id,
  });

  // Fetch gift events for score progression chart
  const { data: giftEvents } = await supabase
    .from("gift_events")
    .select("created_at, team, diamond_value, repeat_count")
    .eq("battle_id", id)
    .order("created_at", { ascending: true })
    .limit(500);

  const stats = statsRaw as {
    total_gifts: number;
    total_diamonds: number;
    team_a_gifts: number;
    team_b_gifts: number;
    top_gifters_a: { tiktok_user: string; total_diamonds: number }[] | null;
    top_gifters_b: { tiktok_user: string; total_diamonds: number }[] | null;
    participant_count_a: number;
    participant_count_b: number;
  } | null;

  const winner =
    battle.winner_team === "A"
      ? battle.team_a_name
      : battle.winner_team === "B"
      ? battle.team_b_name
      : battle.winner_team === "draw"
      ? "Empate!"
      : "Sem vencedor";

  const winnerColor =
    battle.winner_team === "A"
      ? battle.team_a_color
      : battle.winner_team === "B"
      ? battle.team_b_color
      : "#6B6B80";

  const duration =
    battle.started_at && battle.ended_at
      ? Math.floor(
          (new Date(battle.ended_at).getTime() -
            new Date(battle.started_at).getTime()) /
            1000
        )
      : battle.duration_seconds;

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  return (
    <>
      <TopBar title="Relatório da batalha" />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        <Link
          href={`/battles/${id}`}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a batalha
        </Link>

        {/* Winner banner */}
        <div
          className="rounded-xl p-6 text-center border"
          style={{
            background: `${winnerColor}10`,
            borderColor: `${winnerColor}30`,
          }}
        >
          <p className="text-sm text-text-muted mb-1">
            {battle.title} — Resultado
          </p>
          <h1
            className="text-3xl font-black uppercase tracking-wide"
            style={{ color: winnerColor }}
          >
            {battle.winner_team === "draw" ? "🤝 EMPATE" : `🏆 ${winner} venceu!`}
          </h1>
          <div className="flex justify-center gap-8 mt-4 text-lg font-black">
            <span style={{ color: battle.team_a_color }}>
              {battle.team_a_name}: {formatScore(battle.team_a_score)}
            </span>
            <span className="text-text-muted">×</span>
            <span style={{ color: battle.team_b_color }}>
              {battle.team_b_name}: {formatScore(battle.team_b_score)}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Duração",
              value: `${mins}m ${secs}s`,
            },
            {
              label: "Total de presentes",
              value: stats?.total_gifts ?? 0,
            },
            {
              label: "Diamantes totais",
              value: formatScore(stats?.total_diamonds ?? 0),
            },
            {
              label: "Participantes",
              value:
                (stats?.participant_count_a ?? 0) +
                (stats?.participant_count_b ?? 0),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface border border-border rounded-lg p-4 text-center"
            >
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                {s.label}
              </p>
              <p className="text-2xl font-black text-text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Score progression chart */}
        {(giftEvents?.length ?? 0) > 0 && (
          <div className="bg-surface border border-border rounded-lg p-4">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wide mb-4">
              Progressão de pontos
            </h2>
            <BattleScoreChart
              giftEvents={giftEvents ?? []}
              teamAName={battle.team_a_name ?? "Time A"}
              teamBName={battle.team_b_name ?? "Time B"}
              teamAColor={battle.team_a_color ?? "#FF0050"}
              teamBColor={battle.team_b_color ?? "#00B4FF"}
              startedAt={battle.started_at}
            />
          </div>
        )}

        {/* Team breakdown + top gifters */}
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              {
                name: battle.team_a_name,
                color: battle.team_a_color,
                score: battle.team_a_score,
                gifts: stats?.team_a_gifts ?? 0,
                participants: stats?.participant_count_a ?? 0,
                topGifters: stats?.top_gifters_a ?? [],
              },
              {
                name: battle.team_b_name,
                color: battle.team_b_color,
                score: battle.team_b_score,
                gifts: stats?.team_b_gifts ?? 0,
                participants: stats?.participant_count_b ?? 0,
                topGifters: stats?.top_gifters_b ?? [],
              },
            ] as const
          ).map((team) => (
            <div
              key={team.name}
              className="bg-surface border border-border rounded-lg p-4"
              style={{ borderColor: `${team.color}30` }}
            >
              <h3
                className="text-sm font-black uppercase tracking-wide mb-3"
                style={{ color: team.color }}
              >
                {team.name}
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div>
                  <p className="text-lg font-black text-text-primary">
                    {formatScore(team.score)}
                  </p>
                  <p className="text-xs text-text-muted">Pontos</p>
                </div>
                <div>
                  <p className="text-lg font-black text-text-primary">
                    {team.gifts}
                  </p>
                  <p className="text-xs text-text-muted">Presentes</p>
                </div>
                <div>
                  <p className="text-lg font-black text-text-primary">
                    {team.participants}
                  </p>
                  <p className="text-xs text-text-muted">Viewers</p>
                </div>
              </div>
              {(team.topGifters ?? []).length > 0 && (
                <>
                  <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                    Top Gifters
                  </p>
                  <div className="space-y-1">
                    {(team.topGifters ?? []).map((g, i) => (
                      <div
                        key={g.tiktok_user}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted">#{i + 1}</span>
                          <span className="text-text-primary font-medium">
                            @{g.tiktok_user}
                          </span>
                        </div>
                        <span style={{ color: team.color }} className="font-black">
                          {formatScore(g.total_diamonds)} 💎
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Punishment */}
        {battle.punishment && (
          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
              Punição do perdedor
            </p>
            <p className="text-sm text-text-primary">{battle.punishment}</p>
          </div>
        )}
      </main>
    </>
  );
}
