-- ============================================================
-- StreamBattle — Postgres Functions (RPCs)
-- Migration 003
-- ============================================================

-- ============================================================
-- Function: add_gift_score
-- Called by tiktok-service to atomically add points to a team
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_gift_score(
  p_battle_id uuid,
  p_team      text,
  p_points    integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_battle public.battles;
BEGIN
  -- Only update active/paused battles
  IF p_team = 'A' THEN
    UPDATE public.battles
    SET team_a_score = team_a_score + p_points,
        updated_at = now()
    WHERE id = p_battle_id
      AND status IN ('active', 'paused')
    RETURNING * INTO v_battle;
  ELSIF p_team = 'B' THEN
    UPDATE public.battles
    SET team_b_score = team_b_score + p_points,
        updated_at = now()
    WHERE id = p_battle_id
      AND status IN ('active', 'paused')
    RETURNING * INTO v_battle;
  ELSE
    RAISE EXCEPTION 'Invalid team: %. Must be A or B', p_team;
  END IF;

  IF v_battle IS NULL THEN
    RAISE EXCEPTION 'Battle % not found or not active', p_battle_id;
  END IF;

  RETURN json_build_object(
    'team_a_score', v_battle.team_a_score,
    'team_b_score', v_battle.team_b_score
  );
END;
$$;

-- ============================================================
-- Function: register_participant
-- Called by tiktok-service when viewer types !timea/!timeb
-- ============================================================
CREATE OR REPLACE FUNCTION public.register_participant(
  p_battle_id   uuid,
  p_tiktok_user text,
  p_team        text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.battle_participants (battle_id, tiktok_user, team)
  VALUES (p_battle_id, p_tiktok_user, p_team)
  ON CONFLICT (battle_id, tiktok_user)
  DO NOTHING; -- First registration wins, cannot switch teams
END;
$$;

-- ============================================================
-- Function: end_battle
-- Sets status to ended, calculates winner, creates notification
-- ============================================================
CREATE OR REPLACE FUNCTION public.end_battle(p_battle_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_battle    public.battles;
  v_winner    text;
  v_notif_title text;
  v_notif_body  text;
BEGIN
  -- Get battle data
  SELECT * INTO v_battle
  FROM public.battles
  WHERE id = p_battle_id
    AND status IN ('active', 'paused');

  IF v_battle IS NULL THEN
    RAISE EXCEPTION 'Battle % not found or already ended', p_battle_id;
  END IF;

  -- Determine winner
  IF v_battle.team_a_score > v_battle.team_b_score THEN
    v_winner := 'A';
  ELSIF v_battle.team_b_score > v_battle.team_a_score THEN
    v_winner := 'B';
  ELSE
    v_winner := 'draw';
  END IF;

  -- Update battle
  UPDATE public.battles
  SET status = 'ended',
      ended_at = now(),
      winner_team = v_winner,
      updated_at = now()
  WHERE id = p_battle_id;

  -- Create notification
  IF v_winner = 'draw' THEN
    v_notif_title := 'Sua batalha "' || v_battle.title || '" encerrou!';
    v_notif_body  := 'A batalha terminou em empate! ' ||
                     v_battle.team_a_name || ': ' || v_battle.team_a_score || ' pts × ' ||
                     v_battle.team_b_name || ': ' || v_battle.team_b_score || ' pts';
  ELSIF v_winner = 'A' THEN
    v_notif_title := v_battle.team_a_name || ' venceu a batalha "' || v_battle.title || '"!';
    v_notif_body  := v_battle.team_a_name || ' venceu com ' || v_battle.team_a_score ||
                     ' pts vs ' || v_battle.team_b_score || ' pts do ' || v_battle.team_b_name;
  ELSE
    v_notif_title := v_battle.team_b_name || ' venceu a batalha "' || v_battle.title || '"!';
    v_notif_body  := v_battle.team_b_name || ' venceu com ' || v_battle.team_b_score ||
                     ' pts vs ' || v_battle.team_a_score || ' pts do ' || v_battle.team_a_name;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, battle_id)
  VALUES (v_battle.streamer_id, 'battle_ended', v_notif_title, v_notif_body, p_battle_id);

  -- Increment battles_count on profile
  UPDATE public.profiles
  SET battles_count = battles_count + 1,
      updated_at = now()
  WHERE id = v_battle.streamer_id;
END;
$$;

-- ============================================================
-- Function: get_battle_stats
-- Returns aggregated stats for post-battle report
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_battle_stats(p_battle_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'total_gifts', COUNT(*),
    'total_diamonds', SUM(diamond_value * repeat_count),
    'team_a_gifts', COUNT(*) FILTER (WHERE team = 'A'),
    'team_b_gifts', COUNT(*) FILTER (WHERE team = 'B'),
    'top_gifters_a', (
      SELECT json_agg(t ORDER BY total_diamonds DESC)
      FROM (
        SELECT tiktok_user, SUM(diamond_value * repeat_count) AS total_diamonds
        FROM public.gift_events
        WHERE battle_id = p_battle_id AND team = 'A'
        GROUP BY tiktok_user
        ORDER BY total_diamonds DESC
        LIMIT 5
      ) t
    ),
    'top_gifters_b', (
      SELECT json_agg(t ORDER BY total_diamonds DESC)
      FROM (
        SELECT tiktok_user, SUM(diamond_value * repeat_count) AS total_diamonds
        FROM public.gift_events
        WHERE battle_id = p_battle_id AND team = 'B'
        GROUP BY tiktok_user
        ORDER BY total_diamonds DESC
        LIMIT 5
      ) t
    ),
    'participant_count_a', (
      SELECT COUNT(*) FROM public.battle_participants
      WHERE battle_id = p_battle_id AND team = 'A'
    ),
    'participant_count_b', (
      SELECT COUNT(*) FROM public.battle_participants
      WHERE battle_id = p_battle_id AND team = 'B'
    )
  ) INTO v_result
  FROM public.gift_events
  WHERE battle_id = p_battle_id;

  RETURN v_result;
END;
$$;
