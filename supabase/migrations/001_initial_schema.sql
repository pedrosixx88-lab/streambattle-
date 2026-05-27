-- ============================================================
-- StreamBattle — Initial Schema
-- Migration 001: Tables + Trigger
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: profiles
-- ============================================================
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

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  counter int := 0;
BEGIN
  -- Generate username from email prefix
  base_username := lower(split_part(NEW.email, '@', 1));
  -- Remove non-alphanumeric characters
  base_username := regexp_replace(base_username, '[^a-z0-9_]', '', 'g');
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || 'streamer';
  END IF;

  final_username := base_username;

  -- Handle duplicate usernames
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Also create a user_plans entry
  INSERT INTO public.user_plans (user_id, plan)
  VALUES (NEW.id, 'free');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Table: battles
-- ============================================================
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

CREATE TRIGGER update_battles_updated_at
  BEFORE UPDATE ON public.battles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Table: battle_participants
-- ============================================================
CREATE TABLE IF NOT EXISTS public.battle_participants (
  id          uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id   uuid        NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  tiktok_user text        NOT NULL,
  team        text        NOT NULL CHECK (team IN ('A', 'B')),
  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_id, tiktok_user)
);

CREATE INDEX IF NOT EXISTS idx_battle_participants_battle ON public.battle_participants(battle_id);

-- ============================================================
-- Table: gift_events
-- ============================================================
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

-- ============================================================
-- Table: user_plans
-- ============================================================
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

CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Table: notifications
-- ============================================================
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
