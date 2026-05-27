"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface SettingsFormProps {
  profile: Profile;
  userEmail: string;
}

export function SettingsForm({ profile, userEmail }: SettingsFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username);
  const [tiktokUsername, setTiktokUsername] = useState(
    profile.tiktok_username ?? ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!username.trim() || username.length < 3) {
      setError("Username deve ter pelo menos 3 caracteres.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        username: username.trim().toLowerCase(),
        tiktok_username: tiktokUsername.trim().replace(/^@/, "") || null,
      })
      .eq("id", profile.id);

    if (updateError) {
      if (updateError.message.includes("unique")) {
        setError("Este username já está em uso.");
      } else {
        setError("Erro ao salvar. Tente novamente.");
      }
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-success/10 border border-success/20 rounded-md text-success text-sm">
          Perfil atualizado com sucesso!
        </div>
      )}

      {/* Email (readonly) */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={userEmail}
          readOnly
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-muted cursor-not-allowed focus:outline-none"
        />
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          minLength={3}
          maxLength={30}
          required
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
        />
      </div>

      {/* Display name */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Nome de exibição{" "}
          <span className="text-text-muted font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={60}
          placeholder="Seu nome ou apelido"
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
        />
      </div>

      {/* TikTok username */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Usuário TikTok{" "}
          <span className="text-text-muted font-normal">(opcional)</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-sm">@</span>
          <input
            type="text"
            value={tiktokUsername}
            onChange={(e) =>
              setTiktokUsername(e.target.value.replace(/^@/, ""))
            }
            placeholder="seuusuariotiktok"
            maxLength={30}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-colors"
          />
        </div>
        <p className="text-xs text-text-muted mt-1">
          Será pré-preenchido ao criar novas batalhas.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-semibold rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
