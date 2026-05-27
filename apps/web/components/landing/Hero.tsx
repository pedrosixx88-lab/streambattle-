import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 px-6 text-center">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,0,80,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-red/10 text-brand-red border border-brand-red/20 mb-6">
          ⚡ Batalhas ao vivo no TikTok
        </span>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-black text-text-primary leading-tight mb-6">
          Transforme presentes em{" "}
          <span className="text-gradient-battle">batalha épica</span> ao vivo
        </h1>

        <p className="text-lg text-text-muted max-w-2xl mx-auto mb-10">
          Divida sua live do TikTok em dois times. Viewers presenteiam para
          vencer. Barra animada no OBS em tempo real. Zero código.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="px-8 py-3 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-lg transition-colors text-base"
          >
            Começar grátis →
          </Link>
          <Link
            href="#como-funciona"
            className="px-8 py-3 bg-surface border border-border hover:border-text-muted text-text-primary font-medium rounded-lg transition-colors text-base"
          >
            Ver como funciona
          </Link>
        </div>

        {/* Battle bar demo */}
        <div
          className="max-w-2xl mx-auto rounded-xl p-5"
          style={{
            background: "rgba(26,26,31,0.8)",
            border: "1px solid rgba(42,42,50,0.8)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex justify-between text-sm font-bold mb-3">
            <span style={{ color: "#FF0050" }}>⚡ Time Vermelho</span>
            <span className="text-text-muted text-xs">AO VIVO</span>
            <span style={{ color: "#00B4FF" }}>Time Azul 🌊</span>
          </div>
          <div className="flex justify-between text-2xl font-black mb-3">
            <span style={{ color: "#FF0050" }}>4.2K</span>
            <span className="text-text-muted text-sm self-center">VS</span>
            <span style={{ color: "#00B4FF" }}>3.1K</span>
          </div>
          {/* Animated battle bar */}
          <div className="relative flex w-full rounded-full overflow-hidden h-6">
            <div
              className="battle-bar-fill h-full"
              style={{
                width: "57.5%",
                background: "linear-gradient(90deg, #CC003D, #FF0050)",
                boxShadow: "2px 0 12px #FF005060",
              }}
            />
            <div
              className="battle-bar-fill h-full"
              style={{
                width: "42.5%",
                background: "linear-gradient(270deg, #008FCC, #00B4FF)",
                boxShadow: "-2px 0 12px #00B4FF60",
              }}
            />
            {/* Center diamond */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-4 h-4 bg-white rotate-45 shadow-md" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-text-muted mt-2">
            <span>57.5%</span>
            <span className="text-success text-xs">🌹 viewer123 +25 pts</span>
            <span>42.5%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
