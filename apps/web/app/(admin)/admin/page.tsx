import { createClient } from "@/lib/supabase/server";
import { Users, Swords, Activity, TrendingUp } from "lucide-react";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Aggregate stats
  const [
    { count: totalUsers },
    { count: totalBattles },
    { count: activeBattles },
    { count: proUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("battles").select("*", { count: "exact", head: true }),
    supabase
      .from("battles")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("plan", ["pro", "business"]),
  ]);

  // Recent battles
  const { data: recentBattles } = await supabase
    .from("battles")
    .select("id, title, status, created_at, team_a_score, team_b_score, tiktok_username")
    .order("created_at", { ascending: false })
    .limit(10);

  // Recent signups
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, username, display_name, plan, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const stats = [
    {
      label: "Total de usuários",
      value: totalUsers ?? 0,
      icon: Users,
      color: "text-brand-blue",
    },
    {
      label: "Total de batalhas",
      value: totalBattles ?? 0,
      icon: Swords,
      color: "text-brand-red",
    },
    {
      label: "Batalhas ativas",
      value: activeBattles ?? 0,
      icon: Activity,
      color: "text-success",
    },
    {
      label: "Usuários pagos",
      value: proUsers ?? 0,
      icon: TrendingUp,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-text-primary">Visão geral</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Métricas da plataforma em tempo real
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-black text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent battles */}
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-xs font-bold text-text-primary">
              Batalhas recentes
            </h2>
          </div>
          <div className="divide-y divide-border">
            {!recentBattles?.length && (
              <p className="px-4 py-3 text-xs text-text-muted">
                Nenhuma batalha ainda
              </p>
            )}
            {recentBattles?.map((b) => (
              <div key={b.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {b.title}
                  </p>
                  <p className="text-[11px] text-text-muted font-mono">
                    @{b.tiktok_username}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      b.status === "active"
                        ? "bg-success/20 text-success"
                        : b.status === "ended"
                        ? "bg-border text-text-muted"
                        : b.status === "paused"
                        ? "bg-yellow-400/20 text-yellow-400"
                        : "bg-border text-text-muted"
                    }`}
                  >
                    {b.status === "active"
                      ? "AO VIVO"
                      : b.status === "ended"
                      ? "ENCERRADA"
                      : b.status === "paused"
                      ? "PAUSADA"
                      : "RASCUNHO"}
                  </span>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {b.team_a_score} × {b.team_b_score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent signups */}
        <div className="bg-surface border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-xs font-bold text-text-primary">
              Cadastros recentes
            </h2>
          </div>
          <div className="divide-y divide-border">
            {!recentUsers?.length && (
              <p className="px-4 py-3 text-xs text-text-muted">
                Nenhum usuário ainda
              </p>
            )}
            {recentUsers?.map((u) => (
              <div key={u.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {u.display_name || u.username}
                  </p>
                  <p className="text-[11px] text-text-muted font-mono">
                    {u.username}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    u.plan === "pro"
                      ? "bg-brand-blue/20 text-brand-blue"
                      : u.plan === "business"
                      ? "bg-yellow-400/20 text-yellow-400"
                      : "bg-border text-text-muted"
                  }`}
                >
                  {u.plan?.toUpperCase() ?? "FREE"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
