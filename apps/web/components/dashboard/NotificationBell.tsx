"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X, CheckCheck, Swords, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  battle_id: string | null;
  created_at: string;
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "battle_ended":
      return <Swords className="w-3.5 h-3.5 text-brand-red" />;
    case "plan_renewed":
    case "plan_expired":
      return <TrendingUp className="w-3.5 h-3.5 text-brand-blue" />;
    case "limit_reached":
      return <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />;
    default:
      return <Bell className="w-3.5 h-3.5 text-text-muted" />;
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markOneRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full" />
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-10 w-80 bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary">
                Notificações
                {unread > 0 && (
                  <span className="ml-2 bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {loading && !notifications.length && (
                <div className="px-4 py-6 text-center">
                  <div className="w-4 h-4 border-2 border-border border-t-brand-red rounded-full animate-spin mx-auto" />
                </div>
              )}

              {!loading && !notifications.length && (
                <div className="px-4 py-6 text-center text-xs text-text-muted">
                  Nenhuma notificação
                </div>
              )}

              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-surface-hover transition-colors ${
                    !n.read ? "bg-brand-red/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      <NotificationIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs font-medium leading-tight ${
                            !n.read ? "text-text-primary" : "text-text-muted"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <button
                            onClick={() => markOneRead(n.id)}
                            className="shrink-0 w-1.5 h-1.5 bg-brand-red rounded-full mt-1"
                            title="Marcar como lida"
                          />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                          {n.body}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-text-muted">
                          {timeAgo(n.created_at)}
                        </span>
                        {n.battle_id && (
                          <Link
                            href={`/battles/${n.battle_id}/report`}
                            onClick={() => setOpen(false)}
                            className="text-[10px] text-brand-red hover:underline"
                          >
                            Ver relatório →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
