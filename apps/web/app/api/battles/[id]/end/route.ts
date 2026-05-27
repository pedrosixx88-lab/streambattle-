import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { disconnectTikTokService } from "@/lib/battle/tiktok-service";
import { broadcastBattleStatus } from "@/lib/battle/broadcast";
import type { Battle } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

// POST /api/battles/[id]/end
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: rawBattle } = await supabase
    .from("battles")
    .select("*")
    .eq("id", id)
    .eq("streamer_id", user.id)
    .single();

  const battle = rawBattle as Battle | null;

  if (!battle) {
    return NextResponse.json({ error: "Batalha não encontrada" }, { status: 404 });
  }

  if (battle.status === "ended") {
    return NextResponse.json({ error: "Batalha já encerrada" }, { status: 400 });
  }

  if (battle.status === "draft") {
    return NextResponse.json({ error: "Batalha não foi iniciada" }, { status: 400 });
  }

  // Call the end_battle RPC (handles score, winner, notification)
  const admin = createAdminClient();
  const { error: rpcError } = await admin.rpc("end_battle", {
    p_battle_id: id,
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  // Get updated battle
  const { data: ended } = await admin
    .from("battles")
    .select("*")
    .eq("id", id)
    .single();

  // Disconnect TikTok service and broadcast ended status
  await Promise.all([
    disconnectTikTokService(id),
    broadcastBattleStatus(id, "ended"),
  ]);

  return NextResponse.json({ battle: ended });
}
