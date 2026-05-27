import { createClient } from "@/lib/supabase/server";
import { BattleMonitor } from "@/components/admin/BattleMonitor";

export default async function AdminBattlesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = await createClient();

  let query = supabase
    .from("battles")
    .select(
      "id, title, status, team_a_name, team_b_name, team_a_score, team_b_score, tiktok_username, duration_seconds, started_at, ended_at, created_at, streamer_id"
    )
    .order("created_at", { ascending: false });

  const validStatuses = ["active", "paused", "ended", "draft"];
  if (searchParams.status && validStatuses.includes(searchParams.status)) {
    query = query.eq("status", searchParams.status as "active" | "paused" | "ended" | "draft");
  }

  const { data: battles, error } = await query.limit(100);

  // Count active battles
  const { count: activeCount } = await supabase
    .from("battles")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-text-primary">Batalhas</h1>
        <p className="text-xs text-text-muted mt-0.5">
          {activeCount ?? 0} batalhas ativas agora •{" "}
          {battles?.length ?? 0} no filtro atual
        </p>
      </div>

      {error && (
        <div className="bg-brand-red/10 border border-brand-red/30 rounded p-3 text-xs text-brand-red">
          Erro ao carregar: {error.message}
        </div>
      )}

      <BattleMonitor battles={battles ?? []} currentFilter={searchParams.status ?? "all"} />
    </div>
  );
}
