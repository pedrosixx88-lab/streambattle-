export function PlanEditor() {
  const plans = [
    {
      name: "Free",
      color: "text-text-muted",
      features: [
        { label: "Batalhas por mês", value: "5" },
        { label: "Duração máxima", value: "5 minutos" },
        { label: "Temas de overlay", value: "1" },
        { label: "Histórico", value: "7 dias" },
        { label: "Multiplicador de pontos", value: "Não" },
      ],
    },
    {
      name: "Pro",
      color: "text-brand-blue",
      features: [
        { label: "Batalhas por mês", value: "Ilimitado" },
        { label: "Duração máxima", value: "60 minutos" },
        { label: "Temas de overlay", value: "3" },
        { label: "Histórico", value: "90 dias" },
        { label: "Multiplicador de pontos", value: "Sim" },
      ],
    },
    {
      name: "Business",
      color: "text-yellow-400",
      features: [
        { label: "Batalhas por mês", value: "Ilimitado" },
        { label: "Duração máxima", value: "120 minutos" },
        { label: "Temas de overlay", value: "Todos" },
        { label: "Histórico", value: "1 ano" },
        { label: "Multiplicador de pontos", value: "Sim" },
      ],
    },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 text-xs text-yellow-400">
        ℹ️ Os limites de planos são definidos em{" "}
        <code className="font-mono bg-yellow-400/10 px-1 rounded">
          apps/web/lib/battle/plan-limits.ts
        </code>
        . Para alterar, edite o arquivo diretamente.
      </div>

      <div className="grid grid-cols-3 gap-4">
        {plans.map(({ name, color, features }) => (
          <div
            key={name}
            className="bg-surface border border-border rounded-lg overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border">
              <h3 className={`text-xs font-black uppercase ${color}`}>{name}</h3>
            </div>
            <div className="divide-y divide-border">
              {features.map(({ label, value }) => (
                <div key={label} className="px-4 py-2.5 flex justify-between">
                  <span className="text-[11px] text-text-muted">{label}</span>
                  <span className="text-[11px] font-medium text-text-primary">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
