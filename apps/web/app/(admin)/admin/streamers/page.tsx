import { createClient } from "@/lib/supabase/server";
import { StreamerTable } from "@/components/admin/StreamerTable";
import type { PlanType } from "@/types/database";

export default async function AdminStreamersPage({
  searchParams,
}: {
  searchParams: { plan?: string; q?: string };
}) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, username, display_name, tiktok_username, plan, battles_count, created_at, onboarding_completed"
    )
    .order("created_at", { ascending: false });

  const validPlans: PlanType[] = ["free", "pro", "business"];
  if (
    searchParams.plan &&
    searchParams.plan !== "all" &&
    validPlans.includes(searchParams.plan as PlanType)
  ) {
    query = query.eq("plan", searchParams.plan as PlanType);
  }

  if (searchParams.q) {
    query = query.or(
      `username.ilike.%${searchParams.q}%,display_name.ilike.%${searchParams.q}%,tiktok_username.ilike.%${searchParams.q}%`
    );
  }

  const { data: streamers, error } = await query.limit(100);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-text-primary">Streamers</h1>
        <p className="text-xs text-text-muted mt-0.5">
          {streamers?.length ?? 0} usuários encontrados
        </p>
      </div>

      {error && (
        <div className="bg-brand-red/10 border border-brand-red/30 rounded p-3 text-xs text-brand-red">
          Erro ao carregar: {error.message}
        </div>
      )}

      <StreamerTable streamers={streamers ?? []} />
    </div>
  );
}
