import { createClient } from "@/lib/supabase/server";
import { BattleBarOverlay } from "@/components/battle/BattleBarOverlay";
import type { Battle } from "@/types/database";

type Params = { params: Promise<{ battleId: string }> };

// This page is public — no auth required (streamer adds as OBS Browser Source)
export const dynamic = "force-dynamic";

export default async function OverlayPage({ params }: Params) {
  const { battleId } = await params;

  // Use server client (no auth cookie needed — battles are SELECT public via RLS)
  const supabase = await createClient();

  const { data: rawBattle } = await supabase
    .from("battles")
    .select("*")
    .eq("id", battleId)
    .single();

  const battle = rawBattle as Battle | null;

  if (!battle) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "transparent" }}
      >
        <div
          className="text-text-muted text-sm px-4 py-2 rounded-lg"
          style={{ background: "rgba(13,13,15,0.8)" }}
        >
          Batalha não encontrada
        </div>
      </div>
    );
  }

  return <BattleBarOverlay battle={battle} />;
}
