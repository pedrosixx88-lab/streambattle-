import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { disconnectTikTokService } from "@/lib/battle/tiktok-service";

type Params = { params: Promise<{ id: string }> };

// POST /api/battles/[id]/pause
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: battle } = await supabase
    .from("battles")
    .select("id, streamer_id, status")
    .eq("id", id)
    .eq("streamer_id", user.id)
    .single();

  if (!battle) {
    return NextResponse.json({ error: "Batalha não encontrada" }, { status: 404 });
  }

  if (battle.status !== "active") {
    return NextResponse.json({ error: "Batalha não está ativa" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: updated } = await admin
    .from("battles")
    .update({ status: "paused" })
    .eq("id", id)
    .select()
    .single();

  // Disconnect TikTok service
  await disconnectTikTokService(id);

  return NextResponse.json({ battle: updated });
}
