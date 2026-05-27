# StreamBattle — PLAN.md

Plano de implementação por milestones.
**Leia CLAUDE.md antes de usar este arquivo.**

---

## M1 — Fundação do Projeto
**Branch:** `milestone/M1-foundation`

**Objetivo:** Next.js rodando com auth, schema no DB e monorepo configurado.

**Arquivos principais:**
- `package.json` raiz (npm workspaces)
- `apps/web/` — Next.js 14, Tailwind, shadcn
- `apps/web/middleware.ts` — protege `/dashboard`, `/battles`, `/admin`, `/onboarding`
- `apps/web/lib/supabase/` (client, server, admin)
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_functions.sql`
- `supabase/migrations/004_realtime_enable.sql`
- `apps/web/app/(auth)/login/page.tsx` e `register/page.tsx`

**Critérios de aceitação:**
- [ ] `npm run dev` inicia sem erros em localhost:3000
- [ ] Página `/login` renderiza corretamente
- [ ] Página `/register` renderiza corretamente
- [ ] `/dashboard` redireciona para `/login` quando não autenticado
- [ ] `npm run build` passa sem erros de TypeScript

---

## M2 — Motor de Batalha
**Branch:** `milestone/M2-battle-engine`

**Objetivo:** CRUD de batalha + tiktok-service conecta e pontua presentes.

**Arquivos principais:**
- `apps/web/app/api/battles/` (CRUD + start/pause/end)
- `apps/web/lib/battle/` (scoring, plan-limits, tiktok-service, broadcast)
- `packages/tiktok-service/src/` (todos os arquivos)
- `packages/shared-types/src/`

**Fluxo de dados:**
```
TikTok Live → tiktok-service → rpc('add_gift_score') → Supabase Broadcast → Overlay
```

**Critérios de aceitação:**
- [ ] `POST /api/battles` cria batalha no DB
- [ ] `POST /api/battles/[id]/start` muda status para `active` e chama tiktok-service
- [ ] `POST /api/battles/[id]/end` chama `end_battle` RPC e disconnecta o serviço
- [ ] Plano free bloqueia criação da 6ª batalha com mensagem clara
- [ ] Plano free bloqueia duração > 5 min com mensagem clara
- [ ] Gift INSERT manual no DB reflete nos scores via RPC

---

## M3 — Overlay OBS
**Branch:** `milestone/M3-overlay`

**Objetivo:** `/overlay/[battleId]` transparente com barra animada estilo PK Battle do TikTok.

**Arquivos principais:**
- `apps/web/app/overlay/[battleId]/page.tsx`
- `apps/web/components/battle/BattleBar.tsx`
- `apps/web/components/battle/BattleBarOverlay.tsx`
- `apps/web/components/battle/GiftPopIn.tsx`
- `apps/web/hooks/useBattleRealtime.ts`

**Critérios de aceitação:**
- [ ] Background transparente (verificar com DevTools → background: transparent)
- [ ] Barra anima suavemente com `cubic-bezier(0.34, 1.56, 0.64, 1)` ao mudar scores
- [ ] Gift pop-in aparece por 3s e desaparece com fade-out
- [ ] Banner "BATALHA ENCERRADA" ao receber evento `battle-status: ended`
- [ ] URL `/overlay/[id]` funciona sem autenticação
- [ ] Realtime conecta e recebe broadcasts (testar via Supabase SQL Editor)

---

## M4 — Dashboard do Streamer
**Branch:** `milestone/M4-dashboard`

**Objetivo:** UI completa de gerenciamento de batalhas — o coração da plataforma.

**Arquivos principais:**
- `apps/web/app/(dashboard)/layout.tsx` — sidebar + topbar
- `apps/web/app/(dashboard)/dashboard/page.tsx`
- `apps/web/app/(dashboard)/battles/` (list, new, [id], [id]/report)
- `apps/web/components/battle/BattleControlPanel.tsx`
- `apps/web/components/battle/GiftFeed.tsx`
- `apps/web/components/dashboard/Sidebar.tsx`
- `apps/web/components/dashboard/TopBar.tsx`

**Layout do BattleControlPanel:**
```
┌─────────────────────────────────────────────────────────┐
│  [BATALHA AO VIVO]  Nome da Batalha      [⏱ 04:23]     │
├──────────────────────────┬──────────────────────────────┤
│                          │  [▶ Iniciar] [⏸ Pausar]     │
│   BattleBar ao vivo      │  [⏹ Encerrar]               │
│   (grande, animada)      │                              │
│                          │  OBS Overlay URL:            │
│   Time A 1240 | 980 B   │  [URL] [Copiar]              │
│                          │                              │
├──────────────────────────┤  Últimos presentes:          │
│ Time A (43) Time B (31)  │  🌹 viewer123 → A +5 pts   │
└──────────────────────────┴──────────────────────────────┘
```

**Critérios de aceitação:**
- [ ] Dashboard home mostra batalhas ativas e recentes
- [ ] Formulário de criação valida campos obrigatórios em PT-BR
- [ ] Painel de controle atualiza score em tempo real via Realtime
- [ ] Timer faz countdown da duração configurada
- [ ] URL do overlay copia para clipboard com feedback visual
- [ ] Histórico lista todas as batalhas com status, scores e vencedor
- [ ] Settings page permite editar username e TikTok username

---

## M5 — Assinaturas Premium
**Branch:** `milestone/M5-billing`

**Objetivo:** Checkout MercadoPago, enforcement de planos, webhook handler.

**Arquivos principais:**
- `apps/web/lib/mercadopago/client.ts` e `webhooks.ts`
- `apps/web/app/api/billing/` (subscribe, cancel)
- `apps/web/app/api/webhooks/mercadopago/route.ts`
- `apps/web/app/(dashboard)/billing/page.tsx`
- `apps/web/components/billing/`

**Planos:**
| | Free | Pro (R$29/mês) | Business (R$79/mês) |
|---|---|---|---|
| Batalhas/mês | 5 | Ilimitado | Ilimitado |
| Duração max | 5 min | 60 min | 120 min |
| Histórico | 7 dias | 90 dias | 1 ano |
| Multiplicador | Não | Sim | Sim |

**Fluxo MercadoPago:**
1. `POST /api/billing/subscribe` → cria PreApproval → retorna `init_point`
2. Frontend redireciona → usuário paga no MP
3. Webhook → verifica assinatura HMAC-SHA256 (`x-signature: ts=...,v1=...`) → atualiza DB

**Critérios de aceitação:**
- [ ] Clicar "Assinar Pro" redireciona para checkout MP
- [ ] Pagamento sandbox atualiza `user_plans` e `profiles.plan`
- [ ] Free user com 6ª batalha vê modal de upgrade
- [ ] Webhook rejeita requests sem assinatura válida (retorna 401)
- [ ] Billing page mostra plano atual, data de renovação e opção de cancelar

---

## M6 — Landing Page + Onboarding
**Branch:** `milestone/M6-landing-onboarding`

**Objetivo:** Página pública de marketing + wizard de primeiro acesso.

**Arquivos principais:**
- `apps/web/app/page.tsx` — landing page completa
- `apps/web/components/landing/` (Hero, Features, HowItWorks, Pricing, Footer)
- `apps/web/app/onboarding/page.tsx`
- `apps/web/components/onboarding/` (OnboardingSteps, TikTokConnectStep)

**Wizard de Onboarding (5 passos):**
1. Bem-vindo — foto de perfil opcional
2. Seu TikTok — `@username` + botão "Testar conexão"
3. Crie sua primeira batalha — form pré-preenchido
4. Configure o OBS — GIF animado + URL do overlay
5. Pronto! — redirect para dashboard

**Regras:**
- Progresso do wizard salvo em `localStorage` (sobrevive refresh)
- `profiles.onboarding_completed = false` → middleware redireciona para `/onboarding`
- Pricing na landing: CTAs abrem register se não logado, subscribe se logado

**Critérios de aceitação:**
- [ ] Landing page em `/` sem autenticação
- [ ] Seções: Hero com demo visual, Como Funciona (3 passos), Features, Pricing, Footer
- [ ] CTA principal redireciona corretamente
- [ ] Wizard avança/volta entre passos sem perder dados
- [ ] Teste de conexão TikTok retorna feedback em <5s
- [ ] Após completar onboarding, `profiles.onboarding_completed` fica `true`

---

## M7 — Painel Admin
**Branch:** `milestone/M7-admin`

**Objetivo:** Interface interna para o admin (Pedro) gerenciar a plataforma.

**Arquivos principais:**
- `apps/web/app/(admin)/` (layout + páginas)
- `apps/web/components/admin/`
- `apps/web/app/api/admin/`

**Acesso:** `profiles.role = 'admin'` (setado via SQL no Supabase para o email admin).

**Design:** Linear-inspired — compacto, funcional, sem decoração.

**Critérios de aceitação:**
- [ ] Non-admin é redirecionado para `/dashboard`
- [ ] Tabela de usuários com filtro por plano
- [ ] Stats: total users, batalhas ativas, batalhas no mês, MRR estimado
- [ ] Admin pode alterar o plano de um usuário manualmente
- [ ] Monitor de batalhas ativas (refresh automático a cada 30s)

---

## M8 — Notificações, Relatórios e Polish
**Branch:** `milestone/M8-polish`

**Objetivo:** Completude para produção — notificações, relatório pós-batalha, edge cases.

**Arquivos principais:**
- `apps/web/app/api/notifications/route.ts`
- `apps/web/components/dashboard/NotificationBell.tsx`
- `apps/web/app/(dashboard)/battles/[id]/report/page.tsx`
- `apps/web/components/battle/BattleReport.tsx` (charts com Recharts)
- `apps/web/hooks/useNotifications.ts`

**Relatório pós-batalha inclui:**
- Banner vencedor com scores finais
- Gráfico de progressão de pontos ao longo do tempo
- Top 5 gifters por time
- Contagem de participantes por time
- Total de diamantes recebidos

**Edge cases cobertos:**
- tiktok-service offline → banner no dashboard "Reconectar"
- Streamer vai offline → evento DISCONNECTED → broadcast `battle-status: paused`
- Empate → barra centralizada com texto "EMPATE"
- Timer expira → API verifica e encerra automaticamente

**Critérios de aceitação:**
- [ ] Notification bell mostra badge com contagem de não-lidas
- [ ] Marcar como lida atualiza em tempo real
- [ ] Relatório acessível a partir do histórico
- [ ] Gráfico mostra progressão correta dos scores
- [ ] Top gifters listados com nome e total de pontos
- [ ] Todos os estados de erro exibidos em PT-BR
- [ ] `npm run build` passa limpo antes do merge

---

## REGRAS TRANSVERSAIS

- **Ordem obrigatória:** M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8
- **Testar antes de commitar** — critérios de aceitação devem ser verificados manualmente
- **Um PR por milestone** — branch → PR → merge squash → delete branch
- **Build sempre deve passar** — `npm run build` sem erros antes de abrir PR
- **Textos em PT-BR** — toda interface visível ao usuário em português
