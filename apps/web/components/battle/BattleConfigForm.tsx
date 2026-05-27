"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/battle/scoring";

interface BattleConfigFormProps {
  defaultTiktokUsername?: string;
}

export function BattleConfigForm({ defaultTiktokUsername = "" }: BattleConfigFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    tiktok_username: defaultTiktokUsername,
    team_a_name: "Time A",
    team_b_name: "Time B",
    team_a_color: "#FF0050",
    team_b_color: "#00B4FF",
    punishment_a: "",
    punishment_b: "",
    duration_seconds: 300,
    gift_multiplier: 1,
    chat_command_a: "!timea",
    chat_command_b: "!timeb",
  });

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const durationOptions = [
    { label: "1 minuto", value: 60 },
    { label: "2 minutos", value: 120 },
    { label: "5 minutos", value: 300 },
    { label: "10 minutos", value: 600 },
    { label: "15 minutos", value: 900 },
    { label: "30 minutos", value: 1800 },
    { label: "1 hora", value: 3600 },
    { label: "2 horas", value: 7200 },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.title.trim()) {
      setError("Nome da batalha é obrigatório.");
      setLoading(false);
      return;
    }
    if (!form.tiktok_username.trim()) {
      setError("Usuário do TikTok é obrigatório.");
      setLoading(false);
      return;
    }

    try {
      // Serialize per-team punishments into the single `punishment` field as JSON
      const { punishment_a, punishment_b, ...rest } = form;
      const punishment =
        punishment_a || punishment_b
          ? JSON.stringify({ a: punishment_a, b: punishment_b })
          : "";

      const res = await fetch("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, punishment }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao criar batalha.");
        setLoading(false);
        return;
      }

      router.push(`/battles/${data.battle.id}`);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Battle title */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Nome da batalha <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Ex: Batalha de Aniversário"
          maxLength={80}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
        />
      </div>

      {/* TikTok username */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Usuário TikTok da live <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-sm">@</span>
          <input
            type="text"
            value={form.tiktok_username}
            onChange={(e) =>
              set("tiktok_username", e.target.value.replace(/^@/, ""))
            }
            placeholder="seuusuario"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
          />
        </div>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Time A
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={form.team_a_color}
              onChange={(e) => set("team_a_color", e.target.value)}
              className="w-10 h-9 rounded cursor-pointer bg-background border border-border p-0.5"
            />
            <input
              type="text"
              value={form.team_a_name}
              onChange={(e) => set("team_a_name", e.target.value)}
              maxLength={30}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Time B
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={form.team_b_color}
              onChange={(e) => set("team_b_color", e.target.value)}
              className="w-10 h-9 rounded cursor-pointer bg-background border border-border p-0.5"
            />
            <input
              type="text"
              value={form.team_b_name}
              onChange={(e) => set("team_b_name", e.target.value)}
              maxLength={30}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Chat commands */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Comando Time A
          </label>
          <input
            type="text"
            value={form.chat_command_a}
            onChange={(e) => set("chat_command_a", e.target.value)}
            placeholder="!timea"
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Comando Time B
          </label>
          <input
            type="text"
            value={form.chat_command_b}
            onChange={(e) => set("chat_command_b", e.target.value)}
            placeholder="!timeb"
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors font-mono text-sm"
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Duração da batalha
        </label>
        <select
          value={form.duration_seconds}
          onChange={(e) => set("duration_seconds", parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
        >
          {durationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-muted mt-1">
          Plano gratuito: máx. {formatDuration(300)}. Plano Pro: até 1h.
        </p>
      </div>

      {/* Punishments per team (optional) */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-text-primary">
          Punições se perder{" "}
          <span className="text-text-muted font-normal">(opcional)</span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5 font-medium" style={{ color: form.team_a_color }}>
              Se {form.team_a_name || "Time A"} perder:
            </label>
            <input
              type="text"
              value={form.punishment_a}
              onChange={(e) => set("punishment_a", e.target.value)}
              placeholder="Ex: Dançar no próximo vídeo"
              maxLength={120}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5 font-medium" style={{ color: form.team_b_color }}>
              Se {form.team_b_name || "Time B"} perder:
            </label>
            <input
              type="text"
              value={form.punishment_b}
              onChange={(e) => set("punishment_b", e.target.value)}
              placeholder="Ex: Cantar uma música ao vivo"
              maxLength={120}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-text-muted -mt-1">Aparece no relatório final junto com o vencedor.</p>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-semibold rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Criando..." : "Criar batalha"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-surface border border-border hover:border-text-muted text-text-primary font-medium rounded-md transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
