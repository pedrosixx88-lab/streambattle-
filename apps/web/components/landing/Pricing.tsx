import Link from "next/link";

export function Pricing() {
  return (
    <section id="precos" className="py-20 px-6 border-t border-border">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-text-primary mb-3">
            Preços simples
          </h2>
          <p className="text-text-muted">
            Comece gratuitamente. Sem cartão de crédito.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Free */}
          <div className="bg-surface border-2 border-brand-red rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full">
                ATUAL
              </span>
            </div>
            <div className="text-center mb-6">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                Gratuito
              </p>
              <p className="text-4xl font-black text-text-primary">R$0</p>
              <p className="text-text-muted text-xs mt-1">para sempre</p>
            </div>
            <ul className="space-y-2.5 text-sm mb-6">
              {[
                "5 batalhas por mês",
                "Duração máx. 5 minutos",
                "1 tema de overlay",
                "Histórico de 7 dias",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-text-primary">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center py-2.5 px-4 bg-brand-red hover:bg-brand-red/90 text-white font-semibold rounded-md transition-colors text-sm"
            >
              Começar grátis
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-surface border border-border rounded-xl p-6 opacity-60">
            <div className="text-center mb-6">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                Pro
              </p>
              <p className="text-4xl font-black text-brand-blue">R$29</p>
              <p className="text-text-muted text-xs mt-1">/mês</p>
            </div>
            <ul className="space-y-2.5 text-sm mb-6">
              {[
                "Batalhas ilimitadas",
                "Duração máx. 60 minutos",
                "3 temas de overlay",
                "Histórico de 90 dias",
                "Multiplicador de pontos",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-text-muted">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="block w-full text-center py-2.5 px-4 bg-border text-text-muted font-semibold rounded-md text-sm cursor-not-allowed"
            >
              Em breve
            </button>
          </div>

          {/* Business */}
          <div className="bg-surface border border-border rounded-xl p-6 opacity-60">
            <div className="text-center mb-6">
              <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                Business
              </p>
              <p className="text-4xl font-black text-yellow-400">R$79</p>
              <p className="text-text-muted text-xs mt-1">/mês</p>
            </div>
            <ul className="space-y-2.5 text-sm mb-6">
              {[
                "Batalhas ilimitadas",
                "Duração máx. 120 minutos",
                "Todos os temas",
                "Histórico de 1 ano",
                "Multiplicador de pontos",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-text-muted">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="block w-full text-center py-2.5 px-4 bg-border text-text-muted font-semibold rounded-md text-sm cursor-not-allowed"
            >
              Em breve
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
