-- ============================================================
-- StreamBattle — ALL MIGRATIONS (cole tudo isso no SQL Editor)
-- ============================================================

-- ── 001: Schema ──────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid        NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        text        NOT NULL UNIQUE,
  display_name    text,
  avatar_url      text,
  tiktok_username text,
  plan            text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  role            text        NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  onboarding_completed boolean NOT NULL DEFAULT false,
  battles_count   integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base_username text; final_username text; counter int := 0;
BEGIN
  base_username := lower(split_part(NEW.email, '@', 1));
  base_username := regexp_replace(base_username, '[^a-z0-9_]', '', 'g');
  IF length(base_username) < 3 THEN base_username := base_username || 'streamer'; END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1; final_username := base_username || counter::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (NEW.id, final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_plans (user_id, plan) VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE IF NOT EXISTS public.battles (
  id                uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             text        NOT NULL,
  team_a_name       text        NOT NULL DEFAULT 'Time A',
  team_b_name       text        NOT NULL DEFAULT 'Time B',
  team_a_color      text        NOT NULL DEFAULT '#FF0050',
  team_b_color      text        NOT NULL DEFAULT '#00B4FF',
  punishment        text,
  duration_seconds  integer     NOT NULL DEFAULT 300 CHECK (duration_seconds > 0),
  status            text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  team_a_score      bigint      NOT NULL DEFAULT 0,
  team_b_score      bigint      NOT NULL DEFAULT 0,
  tiktok_username   text        NOT NULL,
  started_at        timestamptz,
  ended_at          timestamptz,
  winner_team       text        CHECK (winner_team IN ('A', 'B', 'draw')),
  gift_multiplier   integer     NOT NULL DEFAULT 1 CHECK (gift_multiplier >= 1),
  chat_command_a    text        NOT NULL DEFAULT '!timea',
  chat_command_b    text        NOT NULL DEFAULT '!timeb',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_battles_streamer_status ON public.battles(streamer_id, status);
CREATE INDEX IF NOT EXISTS idx_battles_status ON public.battles(status);

CREATE TABLE IF NOT EXISTS public.battle_participants (
  id          uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id   uuid        NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  tiktok_user text        NOT NULL,
  team        text        NOT NULL CHECK (team IN ('A', 'B')),
  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_id, tiktok_user)
);

CREATE INDEX IF NOT EXISTS idx_battle_participants_battle ON public.battle_participants(battle_id);

CREATE TABLE IF NOT EXISTS public.gift_events (
  id            uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id     uuid        NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  tiktok_user   text        NOT NULL,
  gift_id       integer     NOT NULL,
  gift_name     text,
  repeat_count  integer     NOT NULL DEFAULT 1,
  diamond_value integer     NOT NULL DEFAULT 0,
  team          text        CHECK (team IN ('A', 'B')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_events_battle_created ON public.gift_events(battle_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_plans (
  id                      uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan                    text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  mp_subscription_id      text        UNIQUE,
  mp_preapproval_id       text,
  mp_status               text        CHECK (mp_status IN ('authorized', 'paused', 'cancelled', 'pending')),
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text        NOT NULL CHECK (type IN ('battle_ended', 'plan_renewed', 'plan_expired', 'limit_reached')),
  title       text        NOT NULL,
  body        text,
  read        boolean     NOT NULL DEFAULT false,
  battle_id   uuid        REFERENCES public.battles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);

-- Triggers updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_battles_updated_at') THEN
    CREATE TRIGGER update_battles_updated_at BEFORE UPDATE ON public.battles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_plans_updated_at') THEN
    CREATE TRIGGER update_user_plans_updated_at BEFORE UPDATE ON public.user_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ── 002: RLS ─────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_select_public') THEN
    CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert_own') THEN
    CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'battles_select_public') THEN
    CREATE POLICY "battles_select_public" ON public.battles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'battles_insert_own') THEN
    CREATE POLICY "battles_insert_own" ON public.battles FOR INSERT WITH CHECK (auth.uid() = streamer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'battles_update_own') THEN
    CREATE POLICY "battles_update_own" ON public.battles FOR UPDATE USING (auth.uid() = streamer_id) WITH CHECK (auth.uid() = streamer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'battles_delete_own') THEN
    CREATE POLICY "battles_delete_own" ON public.battles FOR DELETE USING (auth.uid() = streamer_id AND status = 'draft');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'battle_participants_select_public') THEN
    CREATE POLICY "battle_participants_select_public" ON public.battle_participants FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'gift_events_select_own') THEN
    CREATE POLICY "gift_events_select_own" ON public.gift_events FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.battles b WHERE b.id = gift_events.battle_id AND b.streamer_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_plans_select_own') THEN
    CREATE POLICY "user_plans_select_own" ON public.user_plans FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_plans_update_own') THEN
    CREATE POLICY "user_plans_update_own" ON public.user_plans FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_select_own') THEN
    CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_update_own') THEN
    CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ── 003: Functions ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.add_gift_score(p_battle_id uuid, p_team text, p_points integer)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_battle public.battles;
BEGIN
  IF p_team = 'A' THEN
    UPDATE public.battles SET team_a_score = team_a_score + p_points, updated_at = now()
    WHERE id = p_battle_id AND status IN ('active', 'paused') RETURNING * INTO v_battle;
  ELSIF p_team = 'B' THEN
    UPDATE public.battles SET team_b_score = team_b_score + p_points, updated_at = now()
    WHERE id = p_battle_id AND status IN ('active', 'paused') RETURNING * INTO v_battle;
  ELSE RAISE EXCEPTION 'Invalid team: %. Must be A or B', p_team;
  END IF;
  IF v_battle IS NULL THEN RAISE EXCEPTION 'Battle % not found or not active', p_battle_id; END IF;
  RETURN json_build_object('team_a_score', v_battle.team_a_score, 'team_b_score', v_battle.team_b_score);
END; $$;

CREATE OR REPLACE FUNCTION public.register_participant(p_battle_id uuid, p_tiktok_user text, p_team text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.battle_participants (battle_id, tiktok_user, team)
  VALUES (p_battle_id, p_tiktok_user, p_team)
  ON CONFLICT (battle_id, tiktok_user) DO NOTHING;
END; $$;

CREATE OR REPLACE FUNCTION public.end_battle(p_battle_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_battle public.battles; v_winner text; v_notif_title text; v_notif_body text;
BEGIN
  SELECT * INTO v_battle FROM public.battles WHERE id = p_battle_id AND status IN ('active', 'paused');
  IF v_battle IS NULL THEN RAISE EXCEPTION 'Battle % not found or already ended', p_battle_id; END IF;
  IF v_battle.team_a_score > v_battle.team_b_score THEN v_winner := 'A';
  ELSIF v_battle.team_b_score > v_battle.team_a_score THEN v_winner := 'B';
  ELSE v_winner := 'draw'; END IF;
  UPDATE public.battles SET status = 'ended', ended_at = now(), winner_team = v_winner, updated_at = now() WHERE id = p_battle_id;
  IF v_winner = 'draw' THEN
    v_notif_title := 'Sua batalha "' || v_battle.title || '" encerrou!';
    v_notif_body := 'Empate! ' || v_battle.team_a_name || ': ' || v_battle.team_a_score || ' pts × ' || v_battle.team_b_name || ': ' || v_battle.team_b_score || ' pts';
  ELSIF v_winner = 'A' THEN
    v_notif_title := v_battle.team_a_name || ' venceu a batalha "' || v_battle.title || '"!';
    v_notif_body := v_battle.team_a_name || ' venceu com ' || v_battle.team_a_score || ' pts vs ' || v_battle.team_b_score || ' pts';
  ELSE
    v_notif_title := v_battle.team_b_name || ' venceu a batalha "' || v_battle.title || '"!';
    v_notif_body := v_battle.team_b_name || ' venceu com ' || v_battle.team_b_score || ' pts vs ' || v_battle.team_a_score || ' pts';
  END IF;
  INSERT INTO public.notifications (user_id, type, title, body, battle_id) VALUES (v_battle.streamer_id, 'battle_ended', v_notif_title, v_notif_body, p_battle_id);
  UPDATE public.profiles SET battles_count = battles_count + 1, updated_at = now() WHERE id = v_battle.streamer_id;
END; $$;

CREATE OR REPLACE FUNCTION public.get_battle_stats(p_battle_id uuid)
RETURNS json LANGUAGE plpgsql STABLE AS $$
DECLARE v_result json;
BEGIN
  SELECT json_build_object(
    'total_gifts', COUNT(*), 'total_diamonds', SUM(diamond_value * repeat_count),
    'team_a_gifts', COUNT(*) FILTER (WHERE team = 'A'),
    'team_b_gifts', COUNT(*) FILTER (WHERE team = 'B'),
    'top_gifters_a', (SELECT json_agg(t ORDER BY total_diamonds DESC) FROM (SELECT tiktok_user, SUM(diamond_value * repeat_count) AS total_diamonds FROM public.gift_events WHERE battle_id = p_battle_id AND team = 'A' GROUP BY tiktok_user ORDER BY total_diamonds DESC LIMIT 5) t),
    'top_gifters_b', (SELECT json_agg(t ORDER BY total_diamonds DESC) FROM (SELECT tiktok_user, SUM(diamond_value * repeat_count) AS total_diamonds FROM public.gift_events WHERE battle_id = p_battle_id AND team = 'B' GROUP BY tiktok_user ORDER BY total_diamonds DESC LIMIT 5) t),
    'participant_count_a', (SELECT COUNT(*) FROM public.battle_participants WHERE battle_id = p_battle_id AND team = 'A'),
    'participant_count_b', (SELECT COUNT(*) FROM public.battle_participants WHERE battle_id = p_battle_id AND team = 'B')
  ) INTO v_result FROM public.gift_events WHERE battle_id = p_battle_id;
  RETURN v_result;
END; $$;

-- ── 004: Realtime ─────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ── Seed: Admin ───────────────────────────────────────────────
-- (Seta o admin após criar a conta — substitua pelo UUID do seu usuário)
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'SEU-USER-UUID-AQUI';
