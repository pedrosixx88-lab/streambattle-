import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Users, Swords, LayoutDashboard, CreditCard } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const navItems = [
    { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
    { href: "/admin/streamers", label: "Streamers", icon: Users },
    { href: "/admin/battles", label: "Batalhas", icon: Swords },
    { href: "/admin/plans", label: "Planos", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Admin Sidebar */}
      <aside className="w-48 border-r border-border bg-surface flex flex-col fixed top-0 left-0 bottom-0">
        {/* Logo */}
        <div className="h-12 flex items-center px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-red flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-black text-text-primary tracking-tight">
              Stream<span className="text-brand-red">Battle</span>
            </span>
            <span className="text-[10px] bg-brand-red/20 text-brand-red px-1.5 py-0.5 rounded font-bold ml-1">
              ADMIN
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded text-xs text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Back to app */}
        <div className="px-2 py-3 border-t border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded text-xs text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            ← Voltar ao app
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-48 flex-1 p-6">{children}</main>
    </div>
  );
}
