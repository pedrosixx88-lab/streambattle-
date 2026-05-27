"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";

const STORAGE_KEY = "streambattle_onboarding";

interface OnboardingData {
  displayName: string;
  tiktokUsername: string;
  step: number;
}

const defaultData: OnboardingData = {
  displayName: "",
  tiktokUsername: "",
  step: 1,
};

const TOTAL_STEPS = 5;

const stepLabels = [
  "Bem-vindo",
  "Seu TikTok",
  "Primeira batalha",
  "Configurar OBS",
  "Pronto!",
];

interface Props {
  userId: string;
  initialTiktok?: string;
  appUrl: string;
  initialBattleId?: string;
}

export function OnboardingSteps({ userId, initialTiktok, appUrl, initialBattleId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [data, setData] = useState<OnboardingData>(() => {
    if (typeof window === "undefined") return defaultData;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultData;
    } catch {
      return defaultData;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiktokTest, setTiktokTest] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [battleId, setBattleId] = useState<string | null>(initialBattleId ?? null);
  const [battleTitle, setBattleTitle] = useState("Minha primeira batalha");
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialTiktok && !data.tiktokUsername) {
      setData((prev) => ({ ...prev, tiktokUsername: initialTiktok }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTiktok]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function nextStep() {
    setData((prev) => ({ ...prev, step: Math.min(prev.step + 1, TOTAL_STEPS) }));
    setError(null);
  }

  function prevStep() {
    setData((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
    setError(null);
  }

  async function testTikTokConnection() {
    if (!data.tiktokUsername.trim()) {
      setError("Informe seu usuário do TikTok.");
      return;
    }
    setTiktokTest("loading");
    setError(null);
    try {
      const res = await fetch(
        `/api/tiktok/check?username=${encodeURIComponent(data.tiktokUsername.replace(/^@/, ""))}`,
        { signal: AbortSignal.timeout(5000) }
      );
      setTiktokTest(res.ok ? "ok" : "error");
    } catch {
      // Timeout or network error — treat as ok (non-blocking)
      setTiktokTest("ok");
    }
  }

  async function saveProfileStep() {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: data.displayName.trim() || null,
        tiktok_username: data.tiktokUsername.trim().replace(/^@/, "") || null,
      })
      .eq("id", userId);
    setLoading(false);
    if (error) {
      setError("Erro ao salvar perfil.");
      return;
    }
    nextStep();
  }

  async function createFirstBattle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: battleTitle || "Minha primeira batalha",
          tiktok_username: data.tiktokUsername.replace(/^@/, ""),
          team_a_name: "Time A",
          team_b_name: "Time B",
          team_a_color: "#FF0050",
          team_b_color: "#00B4FF",
          duration_seconds: 300,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erro ao criar batalha.");
        setLoading(false);
        return;
      }
      setBattleId(json.battle.id);
      setOverlayUrl(`${appUrl}/overlay/${json.battle.id}`);
      nextStep();
    } catch {
      setError("Erro de conexão.");
    }
    setLoading(false);
  }

  async function completeOnboarding() {
    setLoading(true);
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/dashboard");
  }

  async function copyOverlay() {
    if (!overlayUrl) return;
    await navigator.clipboard.writeText(overlayUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-lg w-full mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isDone = data.step > stepNum;
            const isCurrent = data.step === stepNum;
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone
                      ? "bg-success text-white"
                      : isCurrent
                      ? "bg-brand-red text-white"
                      : "bg-border text-text-muted"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <span
                  className={`text-xs ${
                    isCurrent ? "text-text-primary" : "text-text-muted"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-red transition-all duration-500"
            style={{ width: `${((data.step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="bg-surface border border-border rounded-xl p-8">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Step 1 — Bem-vindo */}
        {data.step === 1 && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-2">👋</div>
            <h2 className="text-2xl font-black text-text-primary">
              Bem-vindo ao StreamBattle!
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Vamos configurar sua conta em 5 passos rápidos. Leva menos de 3 minutos.
            </p>
            <div className="pt-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5 text-left">
                Como quer ser chamado?{" "}
                <span className="text-text-muted font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={data.displayName}
                onChange={(e) => setData((p) => ({ ...p, displayName: e.target.value }))}
                placeholder="Seu nome ou apelido"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
              />
            </div>
            <button
              onClick={nextStep}
              className="w-full py-3 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Começar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 — TikTok */}
        {data.step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🎵</div>
              <h2 className="text-xl font-black text-text-primary">
                Seu usuário do TikTok
              </h2>
              <p className="text-text-muted text-sm mt-1">
                Informe o @ da sua live para conectarmos automaticamente.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Usuário TikTok
              </label>
              <div className="flex gap-2">
                <span className="flex items-center text-text-muted text-sm pl-1">@</span>
                <input
                  type="text"
                  value={data.tiktokUsername}
                  onChange={(e) => {
                    setData((p) => ({
                      ...p,
                      tiktokUsername: e.target.value.replace(/^@/, ""),
                    }));
                    setTiktokTest("idle");
                  }}
                  placeholder="seuusuario"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
                />
              </div>
            </div>
            <button
              onClick={testTikTokConnection}
              disabled={tiktokTest === "loading"}
              className="w-full py-2 bg-surface border border-border hover:border-text-muted text-text-primary text-sm font-medium rounded-md transition-colors disabled:opacity-60"
            >
              {tiktokTest === "loading"
                ? "Testando conexão..."
                : tiktokTest === "ok"
                ? "✅ Conexão verificada!"
                : tiktokTest === "error"
                ? "⚠️ Usuário não encontrado"
                : "Testar conexão"}
            </button>
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 py-2.5 bg-surface border border-border text-text-muted font-medium rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={() => saveProfileStep()}
                disabled={loading || !data.tiktokUsername.trim()}
                className="flex-2 px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1 text-sm"
              >
                {loading ? "Salvando..." : "Continuar"} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Criar batalha */}
        {data.step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">⚔️</div>
              <h2 className="text-xl font-black text-text-primary">
                Crie sua primeira batalha
              </h2>
              <p className="text-text-muted text-sm mt-1">
                Vamos criar uma batalha de demonstração pré-configurada.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Nome da batalha
              </label>
              <input
                type="text"
                value={battleTitle}
                onChange={(e) => setBattleTitle(e.target.value)}
                placeholder="Minha primeira batalha"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 bg-background rounded-lg border border-border text-sm">
              <div>
                <p className="text-text-muted text-xs">Time A</p>
                <p className="font-semibold" style={{ color: "#FF0050" }}>
                  Time A 🔴
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs">Time B</p>
                <p className="font-semibold" style={{ color: "#00B4FF" }}>
                  Time B 🔵
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs">Duração</p>
                <p className="font-medium text-text-primary">5 minutos</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">@TikTok</p>
                <p className="font-medium text-text-primary">
                  @{data.tiktokUsername || "seu_usuario"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 py-2.5 bg-surface border border-border text-text-muted font-medium rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={createFirstBattle}
                disabled={loading}
                className="flex-2 px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-lg transition-colors disabled:opacity-60 text-sm flex items-center gap-1"
              >
                {loading ? "Criando..." : "Criar batalha"}{" "}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — OBS */}
        {data.step === 4 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">📺</div>
              <h2 className="text-xl font-black text-text-primary">
                Configure o OBS
              </h2>
              <p className="text-text-muted text-sm mt-1">
                Adicione a URL abaixo como Browser Source no OBS ou Streamlabs.
              </p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg space-y-3">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Sua URL do Overlay
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={overlayUrl ?? `${appUrl}/overlay/${battleId ?? "..."}`}
                  className="flex-1 px-3 py-2 bg-surface border border-border rounded-md text-text-muted text-xs font-mono truncate focus:outline-none"
                />
                <button
                  onClick={copyOverlay}
                  className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                    copied
                      ? "bg-success/10 border-success/20 text-success"
                      : "bg-surface border-border text-text-muted hover:text-text-primary"
                  }`}
                >
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
            <div className="p-4 bg-surface border border-border rounded-lg text-sm space-y-2">
              <p className="font-semibold text-text-primary">Como adicionar no OBS:</p>
              <ol className="list-decimal list-inside space-y-1 text-text-muted text-xs">
                <li>No OBS, clique em <strong className="text-text-primary">+</strong> em Fontes</li>
                <li>Selecione <strong className="text-text-primary">Browser</strong></li>
                <li>Cole a URL acima</li>
                <li>Defina largura <strong className="text-text-primary">1280</strong> e altura <strong className="text-text-primary">160</strong></li>
                <li>Marque <strong className="text-text-primary">Tela transparente</strong></li>
              </ol>
            </div>
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 py-2.5 bg-surface border border-border text-text-muted font-medium rounded-lg text-sm flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={nextStep}
                className="flex-2 px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-lg text-sm flex items-center gap-1"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5 — Pronto */}
        {data.step === 5 && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-2xl font-black text-text-primary">
              Tudo pronto!
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Sua conta está configurada. Agora é só iniciar a batalha durante a
              sua live e engajar seus viewers!
            </p>
            {battleId && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
                ✅ Batalha criada com sucesso!
              </div>
            )}
            <button
              onClick={completeOnboarding}
              disabled={loading}
              className="w-full py-3 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Finalizando..." : "Ir para o Dashboard →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
