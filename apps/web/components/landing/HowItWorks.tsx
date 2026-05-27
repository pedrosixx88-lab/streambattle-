export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Crie a batalha",
      description:
        "Configure dois times com nomes, cores e comandos do chat. Defina o tempo e o castigo do perdedor.",
      icon: "⚙️",
    },
    {
      number: "02",
      title: "Viewers escolhem o time",
      description:
        "Durante a live, viewers digitam !timea ou !timeb no chat para entrar em um time. Simples assim.",
      icon: "💬",
    },
    {
      number: "03",
      title: "Presentes viram pontos",
      description:
        "Cada presente enviado ao streamer conta como pontos para o time do viewer. A barra do OBS atualiza em tempo real.",
      icon: "🎁",
    },
  ];

  return (
    <section
      id="como-funciona"
      className="py-20 px-6 border-t border-border"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black text-text-primary mb-3">
            Como funciona
          </h2>
          <p className="text-text-muted">
            Pronto para a primeira batalha em menos de 5 minutos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="text-xs font-black text-brand-red mb-2 tracking-widest">
                PASSO {step.number}
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
