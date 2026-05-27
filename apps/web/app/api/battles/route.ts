import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  checkCanCreateBattle,
  checkBattleDuration,
  checkGiftMultiplier,
  getBattlesThisMonth,
} from "@/lib/battle/plan-limits";
import type { BattleInsert } from "@/types/database";

// GET /api/battles — list own battles
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("battles")
    .select("*", { count: "exact" })
    .eq("streamer_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ battles: data, total: count, page, limit });
}

// POST /api/battles — create new battle
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();

  // Validate required fields
  const { title, tiktok_username, duration_seconds, gift_multiplier = 1 } = body;

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "Nome da batalha é obrigatório" },
      { status: 400 }
    );
  }

  if (!tiktok_username?.trim()) {
    return NextResponse.json(
      { error: "Usuário do TikTok é obrigatório" },
      { status: 400 }
    );
  }

  // Get user's plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan ?? "free") as "free" | "pro" | "business";

  // Check plan limits
  const battlesThisMonth = await getBattlesThisMonth(user.id, supabase);
  const canCreate = checkCanCreateBattle(plan, battlesThisMonth);
  if (!canCreate.allowed) {
    return NextResponse.json(
      { error: canCreate.message, code: canCreate.error },
      { status: 403 }
    );
  }

  if (duration_seconds) {
    const canDuration = checkBattleDuration(plan, duration_seconds);
    if (!canDuration.allowed) {
      return NextResponse.json(
        { error: canDuration.message, code: canDuration.error },
        { status: 403 }
      );
    }
  }

  if (gift_multiplier > 1) {
    const canMultiplier = checkGiftMultiplier(plan, gift_multiplier);
    if (!canMultiplier.allowed) {
      return NextResponse.json(
        { error: canMultiplier.message, code: canMultiplier.error },
        { status: 403 }
      );
    }
  }

  // Create the battle
  const battleData: BattleInsert = {
    streamer_id: user.id,
    title: title.trim(),
    tiktok_username: tiktok_username.trim().replace(/^@/, ""),
    team_a_name: body.team_a_name?.trim() || "Time A",
    team_b_name: body.team_b_name?.trim() || "Time B",
    team_a_color: body.team_a_color || "#FF0050",
    team_b_color: body.team_b_color || "#00B4FF",
    punishment: body.punishment?.trim() || null,
    duration_seconds: duration_seconds ?? 300,
    gift_multiplier,
    chat_command_a: body.chat_command_a?.trim() || "!timea",
    chat_command_b: body.chat_command_b?.trim() || "!timeb",
    status: "draft",
  };

  const { data, error } = await supabase
    .from("battles")
    .insert(battleData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ battle: data }, { status: 201 });
}
