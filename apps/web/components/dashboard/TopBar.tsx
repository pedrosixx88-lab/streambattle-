import { createClient } from "@/lib/supabase/server";
import { Bell } from "lucide-react";
import Link from "next/link";

export async function TopBar({ title }: { title?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, username, plan")
        .eq("id", user.id)
        .single()
    : { data: null };

  // Unread notification count
  const { count: unreadCount } = user
    ? await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false)
    : { count: 0 };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-surface/60 backdrop-blur-sm">
      <h1 className="text-base font-semibold text-text-primary">
        {title ?? "StreamBattle"}
      </h1>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <Link
          href="/dashboard"
          className="relative p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          <Bell className="w-4 h-4" />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full" />
          )}
        </Link>

        {/* Plan badge */}
        {profile?.plan && profile.plan !== "free" && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
              profile.plan === "business"
                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                : "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
            }`}
          >
            {profile.plan}
          </span>
        )}

        {/* User */}
        <div className="text-sm text-text-muted">
          {profile?.display_name ?? profile?.username ?? user?.email}
        </div>
      </div>
    </header>
  );
}
