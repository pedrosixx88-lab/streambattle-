import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { connectTikTokService } from "@/lib/battle/tiktok-service";
import type { Battle } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

// POST /api/battles/[id]/start
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Fetch the battle
  const { data: rawBattle, error: fetchError } = await supabase
    .from("battles")
    .select("*")
    .eq("id", id)
    .eq("streamer_id", user.id)
    .single();

  const battle = rawBattle as Battle | null;

  if (fetchError || !battle) {
    return NextResponse.json({ error: "Batalha não encontrada" }, { status: 404 });
  }

  if (battle.status === "active") {
    return NextResponse.json({ error: "Batalha já está ativa" }, { status: 400 });
  }

  if (battle.status === "ended") {
    return NextResponse.json({ error: "Batalha já foi encerrada" }, { status: 400 });
  }

  // Update status to active
  const { data: updated, error: updateError } = await supabase
    .from("battles")
    .update({
      status: "active",
      started_at: battle.started_at ?? new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: "Erro ao iniciar batalha" }, { status: 500 });
  }

  // Connect to TikTok Live (fire-and-forget — battle is started even if service is down)
  const serviceResult = await connectTikTokService({
    battleId: id,
    tiktokUsername: battle.tiktok_username,
    chatCommandA: battle.chat_command_a,
    chatCommandB: battle.chat_command_b,
    giftMultiplier: battle.gift_multiplier,
    teamAName: battle.team_a_name,
    teamBName: battle.team_b_name,
  });

  return NextResponse.json({
    battle: updated,
    tiktokConnected: serviceResult.ok,
    tiktokError: serviceResult.error ?? null,
  });
}
