import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-brand-red flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-text-primary tracking-tight">
            Stream<span className="text-brand-red">Battle</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-text-muted">
          <Link href="/login" className="hover:text-text-primary transition-colors">
            Entrar
          </Link>
          <Link href="/register" className="hover:text-text-primary transition-colors">
            Criar conta
          </Link>
          <Link href="#como-funciona" className="hover:text-text-primary transition-colors">
            Como funciona
          </Link>
          <Link href="#precos" className="hover:text-text-primary transition-colors">
            Preços
          </Link>
        </div>

        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} StreamBattle. Feito para streamers 🇧🇷
        </p>
      </div>
    </footer>
  );
}
