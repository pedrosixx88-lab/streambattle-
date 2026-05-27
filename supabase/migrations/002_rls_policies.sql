-- ============================================================
-- StreamBattle — Row Level Security Policies
-- Migration 002
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles policies
-- ============================================================

-- Anyone can read profiles (needed for public streamer pages)
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can insert their own profile (handled by trigger, but just in case)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- battles policies
-- ============================================================

-- Anyone can read battles (needed for overlay — no auth)
CREATE POLICY "battles_select_public"
  ON public.battles FOR SELECT
  USING (true);

-- Authenticated users can create battles
CREATE POLICY "battles_insert_own"
  ON public.battles FOR INSERT
  WITH CHECK (auth.uid() = streamer_id);

-- Only streamer can update their battles
CREATE POLICY "battles_update_own"
  ON public.battles FOR UPDATE
  USING (auth.uid() = streamer_id)
  WITH CHECK (auth.uid() = streamer_id);

-- Only streamer can delete their draft battles
CREATE POLICY "battles_delete_own"
  ON public.battles FOR DELETE
  USING (auth.uid() = streamer_id AND status = 'draft');

-- ============================================================
-- battle_participants policies
-- ============================================================

-- Public read (overlay can show participant counts)
CREATE POLICY "battle_participants_select_public"
  ON public.battle_participants FOR SELECT
  USING (true);

-- Only service role can insert (tiktok-service uses service_role key)
-- Regular users cannot insert participants directly

-- ============================================================
-- gift_events policies
-- ============================================================

-- Streamers can read gift events for their own battles
CREATE POLICY "gift_events_select_own"
  ON public.gift_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battles b
      WHERE b.id = gift_events.battle_id
      AND b.streamer_id = auth.uid()
    )
  );

-- Service role only for inserts (enforced by service_role key bypass)

-- ============================================================
-- user_plans policies
-- ============================================================

-- Users can read their own plan
CREATE POLICY "user_plans_select_own"
  ON public.user_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own plan (limited — main updates via service)
CREATE POLICY "user_plans_update_own"
  ON public.user_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- notifications policies
-- ============================================================

-- Users can read their own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
