import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/dashboard/TopBar";
import { BattleCard } from "@/components/battle/BattleCard";
import { Plus } from "lucide-react";
import type { Battle } from "@/types/database";

export default async function BattlesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rawBattles } = await supabase
    .from("battles")
    .select("*")
    .eq("streamer_id", user.id)
    .order("created_at", { ascending: false });

  const battles = (rawBattles ?? []) as Battle[];

  const active = battles.filter((b) => b.status === "active" || b.status === "paused");
  const ended = battles.filter((b) => b.status === "ended");
  const drafts = battles.filter((b) => b.status === "draft");

  return (
    <>
      <TopBar title="Batalhas" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Suas batalhas
            </h2>
            <p className="text-sm text-text-muted">
              {battles.length} batalha{battles.length !== 1 ? "s" : ""} no total
            </p>
          </div>
          <Link
            href="/battles/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red/90 text-white text-sm font-semibold rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova batalha
          </Link>
        </div>

        {battles.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <p className="text-text-muted text-sm mb-4">
              Nenhuma batalha encontrada.
            </p>
            <Link
              href="/battles/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-semibold rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar batalha
            </Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                  ⚡ Ao vivo
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {active.map((b) => (
                    <BattleCard key={b.id} battle={b} />
                  ))}
                </div>
              </section>
            )}

            {drafts.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                  Rascunhos
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {drafts.map((b) => (
                    <BattleCard key={b.id} battle={b} />
                  ))}
                </div>
              </section>
            )}

            {ended.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                  Histórico
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {ended.map((b) => (
                    <BattleCard key={b.id} battle={b} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
