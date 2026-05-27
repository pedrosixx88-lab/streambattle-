import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

// GET /api/battles/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("battles")
    .select("*")
    .eq("id", id)
    .eq("streamer_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Batalha não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ battle: data });
}

// PATCH /api/battles/[id] — update config (only on draft/paused)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();

  // Ensure only allowed fields are updated
  const allowed = [
    "title",
    "team_a_name",
    "team_b_name",
    "team_a_color",
    "team_b_color",
    "punishment",
    "duration_seconds",
    "gift_multiplier",
    "chat_command_a",
    "chat_command_b",
    "tiktok_username",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from("battles")
    .update(updates)
    .eq("id", id)
    .eq("streamer_id", user.id)
    .in("status", ["draft", "paused"])
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Não foi possível atualizar a batalha" },
      { status: 400 }
    );
  }

  return NextResponse.json({ battle: data });
}

// DELETE /api/battles/[id] — only draft battles
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { error } = await supabase
    .from("battles")
    .delete()
    .eq("id", id)
    .eq("streamer_id", user.id)
    .eq("status", "draft");

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível excluir a batalha" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
