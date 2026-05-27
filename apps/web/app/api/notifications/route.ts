import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json(
      { error: "Erro ao buscar notificações" },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { id, markAllRead } = body as { id?: string; markAllRead?: boolean };

  if (markAllRead) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      return NextResponse.json(
        { error: "Erro ao marcar notificações como lidas" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }

  if (id) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Erro ao atualizar notificação" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Parâmetros inválidos" },
    { status: 400 }
  );
}
