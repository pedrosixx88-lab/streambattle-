import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { BattleControlPanel } from "@/components/battle/BattleControlPanel";
import type { Battle } from "@/types/database";
import Link from "next/link";
import { ArrowLeft, BarChart2 } from "lucide-react";

type Params = { params: Promise<{ id: string }> };

export default async function BattlePage({ params }: Params) {
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <>
      <TopBar title={battle.title} />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/battles"
            className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para batalhas
          </Link>
          {battle.status === "ended" && (
            <Link
              href={`/battles/${id}/report`}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border hover:border-text-muted text-text-primary text-sm font-medium rounded-md transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Ver relatório
            </Link>
          )}
        </div>
        <BattleControlPanel battle={battle} appUrl={appUrl} />
      </main>
    </>
  );
}
