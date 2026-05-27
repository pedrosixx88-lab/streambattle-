"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-lg font-bold text-text-primary">
          Algo deu errado
        </h2>
        <p className="text-sm text-text-muted">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-text-muted font-mono">
            ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 bg-brand-red hover:bg-brand-red/90 text-white text-sm font-semibold rounded-md transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/login"
            className="px-4 py-2 border border-border text-text-muted hover:text-text-primary text-sm rounded-md transition-colors"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
