import { createClient } from "@/lib/supabase/server";
import { PlanEditor } from "@/components/admin/PlanEditor";

export default async function AdminPlansPage() {
  const supabase = await createClient();

  // Get plan distribution
  const { data: planStats } = await supabase
    .from("profiles")
    .select("plan");

  const distribution = {
    free: 0,
    pro: 0,
    business: 0,
  };

  planStats?.forEach((p) => {
    const plan = p.plan as keyof typeof distribution;
    if (plan in distribution) distribution[plan]++;
  });

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-text-primary">Planos</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Distribuição de planos e limites
        </p>
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { plan: "Free", count: distribution.free, color: "text-text-muted" },
          { plan: "Pro", count: distribution.pro, color: "text-brand-blue" },
          { plan: "Business", count: distribution.business, color: "text-yellow-400" },
        ].map(({ plan, count, color }) => (
          <div
            key={plan}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <p className={`text-xs font-bold mb-1 ${color}`}>{plan.toUpperCase()}</p>
            <p className="text-2xl font-black text-text-primary">{count}</p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {total > 0 ? Math.round((count / total) * 100) : 0}% do total
            </p>
          </div>
        ))}
      </div>

      <PlanEditor />
    </div>
  );
}
