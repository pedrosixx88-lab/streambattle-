import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { BattleConfigForm } from "@/components/battle/BattleConfigForm";

export default async function NewBattlePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Pre-fill TikTok username from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("tiktok_username")
    .eq("id", user.id)
    .single();

  return (
    <>
      <TopBar title="Nova batalha" />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            Criar nova batalha
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Configure os times, duração e comandos do chat.
          </p>
        </div>
        <BattleConfigForm defaultTiktokUsername={profile?.tiktok_username ?? ""} />
      </main>
    </>
  );
}
