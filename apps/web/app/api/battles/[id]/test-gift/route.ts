import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Battle, TeamSide } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

// POST /api/battles/[id]/test-gift
// Simula um presente para testar o sistema sem estar ao vivo no TikTok.
// Só funciona em batalhas ativas.
export async function POST(req: NextRequest, { params }: Params) {
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

  if (battle.status !== "active") {
    return NextResponse.json(
      { error: "Batalha precisa estar ativa para receber presentes" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const team: TeamSide = body.team === "B" ? "B" : "A";
  const points = Math.max(1, Math.min(1000, Number(body.points) || 10));
  const giftName: string = body.giftName || "Rosa 🌹";
  const tiktokUser: string = body.tiktokUser || "testviewer";

  // Add points via RPC
  const { data: scores, error: rpcError } = await supabase.rpc("add_gift_score", {
    p_battle_id: id,
    p_team: team,
    p_points: points,
  });

  if (rpcError) {
    return NextResponse.json({ error: "Erro ao adicionar pontos" }, { status: 500 });
  }

  // Insert gift event record
  await supabase.from("gift_events").insert({
    battle_id: id,
    tiktok_user: tiktokUser,
    gift_id: 0,
    gift_name: giftName,
    repeat_count: 1,
    diamond_value: points,
    team,
  });

  // Broadcast via Supabase Realtime HTTP API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const scoreResult = scores as { team_a_score: number; team_b_score: number } | null;

  await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      messages: [
        {
          topic: `battle:${id}`,
          event: "score-update",
          payload: {
            type: "score-update",
            battleId: id,
            teamAScore: scoreResult?.team_a_score ?? battle.team_a_score,
            teamBScore: scoreResult?.team_b_score ?? battle.team_b_score,
            lastGift: {
              user: tiktokUser,
              giftName,
              giftId: 0,
              team,
              points,
              diamondValue: points,
              repeatCount: 1,
            },
          },
        },
      ],
    }),
  }).catch(() => null); // Fire-and-forget

  return NextResponse.json({
    success: true,
    team,
    points,
    teamAScore: scoreResult?.team_a_score ?? 0,
    teamBScore: scoreResult?.team_b_score ?? 0,
  });
}
