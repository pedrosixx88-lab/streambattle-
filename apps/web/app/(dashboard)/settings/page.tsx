import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <>
      <TopBar title="Configurações" />
      <main className="flex-1 p-6 max-w-xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary">Perfil</h2>
          <p className="text-sm text-text-muted mt-1">
            Atualize seus dados de perfil e conexão com o TikTok.
          </p>
        </div>
        {profile && <SettingsForm profile={profile} userEmail={user.email ?? ""} />}
      </main>
    </>
  );
}
