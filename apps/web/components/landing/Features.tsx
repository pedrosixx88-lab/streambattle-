const features = [
  {
    icon: "📺",
    title: "Overlay OBS pronto",
    description:
      "Adicione a URL como Browser Source no OBS. Fundo transparente, barra animada com efeito spring.",
  },
  {
    icon: "⚡",
    title: "Tempo real",
    description:
      "Scores atualizam em menos de 1 segundo via Supabase Realtime. Viewers veem o resultado instantâneo.",
  },
  {
    icon: "💎",
    title: "Todos os presentes",
    description:
      "Compatível com todos os presentes do TikTok. Diamantes são convertidos em pontos automaticamente.",
  },
  {
    icon: "🏆",
    title: "Relatório completo",
    description:
      "Ao encerrar, veja top gifters por time, total de diamantes e histórico completo da batalha.",
  },
  {
    icon: "🛡️",
    title: "Anti-fraude",
    description:
      "Cada viewer só pode estar em um time. Presentes são processados apenas quando a sequência é completa.",
  },
  {
    icon: "📱",
    title: "Sem app extra",
    description:
      "Viewers não precisam instalar nada. Só digitar um comando no chat durante a live.",
  },
];

export function Features() {
  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-text-primary mb-3">
            Tudo que você precisa
          </h2>
          <p className="text-text-muted">
            Projetado para streamers brasileiros do TikTok.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface border border-border rounded-lg p-5 hover:border-text-muted/40 transition-colors"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-sm font-bold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-text-muted text-xs leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
