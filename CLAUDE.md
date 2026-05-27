# StreamBattle — CLAUDE.md

Guia obrigatório para o agente Claude Code.
**Leia este arquivo e o PLAN.md antes de criar qualquer milestone.**

---

## 1. VISÃO GERAL DO PROJETO

Plataforma de batalha de presentes ao vivo para streamers do TikTok.
Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Vercel · Node.js

Monorepo npm workspaces:
- `apps/web` — aplicação Next.js principal
- `packages/tiktok-service` — serviço Node.js long-running (Railway)
- `packages/shared-types` — tipos TypeScript compartilhados

---

## 2. FLUXO OBRIGATÓRIO POR MILESTONE

Para cada milestone, siga **exatamente** esta sequência:

### Passo 1 — Ler o contexto
```
Leia CLAUDE.md e PLAN.md antes de começar.
```

### Passo 2 — Criar branch
```bash
git checkout -b milestone/M<número>-<slug-curto>
# Exemplo: git checkout -b milestone/M1-foundation
```

### Passo 3 — Implementar
- Construa **apenas** o que está no milestone atual
- Não antecipe código de milestones futuros
- Siga o design system definido em PLAN.md

### Passo 4 — Testar (OBRIGATÓRIO antes do commit)
- Rode `npm run dev` e verifique que o app sobe sem erros
- Teste manualmente os critérios de aceitação do milestone
- Rode `npm run build` — o build deve passar limpo

### Passo 5 — Commit, PR, Merge e limpeza
```bash
# Commit
git add -A
git commit -m "feat: <descrição do milestone>"

# Abrir PR para main
gh pr create --title "feat: M<N> — <nome do milestone>" --body "<lista de o que foi feito>"

# Merge do PR
gh pr merge --squash --delete-branch
```

---

## 3. REGRAS DE DESENVOLVIMENTO

### Código
- TypeScript strict — sem `any` explícito
- Todos os textos visíveis ao usuário em **Português Brasileiro**
- Mensagens de erro claras e em PT-BR
- Componentes com `"use client"` só quando necessário (preferir Server Components)

### Banco de dados
- Nunca usar o `service_role` client no browser
- Sempre usar RLS — nunca bypassar com service_role desnecessariamente
- Mutations críticas via RPC Postgres (add_gift_score, end_battle, etc.)

### API Routes
- Sempre verificar `supabase.auth.getUser()` antes de qualquer operação
- Retornar erros em PT-BR: `{ error: "mensagem em português" }`
- Status HTTP semânticos: 401 (não autenticado), 403 (sem permissão), 404, 500

### Segurança
- Variáveis com `SUPABASE_SERVICE_ROLE_KEY` só em server-side
- Webhook do MercadoPago: sempre verificar assinatura `x-signature`
- tiktok-service: sempre verificar `x-service-secret`

### Design System (obrigatório)
Cores definidas em `tailwind.config.ts`:
- Background: `#0D0D0F` → `bg-background`
- Surface/Card: `#1A1A1F` → `bg-surface`
- Borda: `#2A2A32` → `border-border`
- Vermelho (Time A / CTA): `#FF0050` → `bg-brand-red`
- Azul (Time B): `#00B4FF` → `bg-brand-blue`
- Texto principal: `#F0F0F5` → `text-text-primary`
- Texto secundário: `#6B6B80` → `text-text-muted`

---

## 4. COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev                          # Inicia apps/web em localhost:3000
npm run tiktok-service               # Inicia tiktok-service em localhost:3001

# Build e verificação
npm run build                        # Build de produção (deve passar sem erros)
npm run lint                         # Lint

# Supabase (na raiz do projeto)
npx supabase db push                 # Aplica migrations no projeto remoto
npx supabase db reset                # Reset local (apenas dev)
npx supabase gen types typescript    # Regenera types do schema

# Git / GitHub
git checkout -b milestone/M<N>-<slug>
gh pr create --title "..." --body "..."
gh pr merge --squash --delete-branch
```

---

## 5. ESTRUTURA DE ARQUIVOS CRÍTICOS

```
StreamBattle/
├── CLAUDE.md              ← Este arquivo (leia sempre)
├── PLAN.md                ← Plano completo com milestones
├── .env.example           ← Todas as variáveis necessárias
├── apps/web/
│   ├── app/               ← Next.js App Router
│   ├── components/        ← Componentes React
│   ├── hooks/             ← Custom hooks
│   ├── lib/               ← Utilitários e clientes
│   └── types/database.ts  ← Tipos do Supabase
├── packages/
│   ├── shared-types/      ← Tipos compartilhados
│   └── tiktok-service/    ← Serviço TikTok
└── supabase/
    └── migrations/        ← SQL migrations
```

---

## 6. VARIÁVEIS DE AMBIENTE

Copiar `.env.example` para `apps/web/.env.local` e preencher.
Ver `.env.example` na raiz para a lista completa.

**NUNCA** commitar `.env.local` ou qualquer arquivo com keys reais.

---

## 7. MILESTONES

Ver `PLAN.md` para a lista completa e critérios de aceitação de cada milestone.

Sequência:
- **M1** — Fundação (Next.js, auth, DB schema, monorepo) ← *em andamento*
- **M2** — Motor de batalha (API routes, tiktok-service)
- **M3** — Overlay OBS (BattleBar animada, Realtime)
- **M4** — Dashboard do streamer (UI completa)
- **M5** — MercadoPago (assinaturas, webhooks)
- **M6** — Landing page + Onboarding
- **M7** — Painel admin
- **M8** — Notificações, relatórios, polish
