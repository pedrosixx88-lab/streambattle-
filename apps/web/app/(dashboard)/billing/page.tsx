import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: plan } = await supabase
    .from("user_plans")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <>
      <TopBar title="Plano" />
      <main className="flex-1 p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            Plano e assinatura
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Gerencie sua assinatura e benefícios do plano.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                Plano atual
              </p>
              <p className="text-2xl font-black text-text-primary uppercase">
                {plan?.plan ?? "Free"}
              </p>
            </div>
            {plan?.current_period_end && (
              <div className="text-right">
                <p className="text-xs text-text-muted">Renova em</p>
                <p className="text-sm font-medium text-text-primary">
                  {new Date(plan.current_period_end).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-text-muted">
            Upgrade para Pro ou Business disponível em breve. 🚀
          </p>
        </div>
      </main>
    </>
  );
}
