import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { BattleCard } from "@/components/battle/BattleCard";
import { Plus } from "lucide-react";
import type { Battle } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("battles_count, plan")
    .eq("id", user.id)
    .single();

  // Active battles
  const { data: rawActiveBattles } = await supabase
    .from("battles")
    .select("*")
    .eq("streamer_id", user.id)
    .in("status", ["active", "paused"])
    .order("started_at", { ascending: false });

  const activeBattles = (rawActiveBattles ?? []) as Battle[];

  // Recent ended/draft battles
  const { data: rawRecentBattles } = await supabase
    .from("battles")
    .select("*")
    .eq("streamer_id", user.id)
    .in("status", ["ended", "draft"])
    .order("created_at", { ascending: false })
    .limit(6);

  const recentBattles = (rawRecentBattles ?? []) as Battle[];

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Batalhas totais"
            value={profile?.battles_count ?? 0}
            description="Total de batalhas encerradas"
          />
          <StatCard
            label="Batalhas ao vivo"
            value={activeBattles.length}
            color={activeBattles.length > 0 ? "green" : "default"}
            description={activeBattles.length > 0 ? "Em andamento agora" : "Nenhuma ativa"}
          />
          <StatCard
            label="Plano atual"
            value={(profile?.plan ?? "free").toUpperCase()}
            color={
              profile?.plan === "business"
                ? "yellow"
                : profile?.plan === "pro"
                ? "blue"
                : "default"
            }
          />
        </div>

        {/* Active battles */}
        {activeBattles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                ⚡ Ao vivo agora
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {activeBattles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} />
              ))}
            </div>
          </section>
        )}

        {/* Recent battles + CTA */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              Batalhas recentes
            </h2>
            <Link
              href="/battles/new"
              className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red/90 text-white text-sm font-semibold rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova batalha
            </Link>
          </div>

          {recentBattles.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-12 text-center">
              <p className="text-text-muted text-sm mb-4">
                Você ainda não tem batalhas. Crie a sua primeira!
              </p>
              <Link
                href="/battles/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-semibold rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Criar primeira batalha
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {recentBattles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
