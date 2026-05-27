-- ============================================================
-- StreamBattle — Enable Supabase Realtime
-- Migration 004
-- ============================================================

-- Enable Realtime publication on key tables
-- (battles table for Postgres Changes CDC on dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Note: Battle score broadcasts from the tiktok-service use the
-- Realtime Broadcast HTTP endpoint, not Postgres Changes.
-- Postgres Changes are used for the dashboard gift feed.
