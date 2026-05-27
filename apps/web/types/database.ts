export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BattleStatus = "draft" | "active" | "paused" | "ended";
export type TeamSide = "A" | "B";
export type PlanType = "free" | "pro" | "business";
export type UserRole = "user" | "admin";
export type NotificationType =
  | "battle_ended"
  | "plan_renewed"
  | "plan_expired"
  | "limit_reached";
export type MpStatus = "authorized" | "paused" | "cancelled" | "pending";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          tiktok_username: string | null;
          plan: PlanType;
          role: UserRole;
          onboarding_completed: boolean;
          battles_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          tiktok_username?: string | null;
          plan?: PlanType;
          role?: UserRole;
          onboarding_completed?: boolean;
          battles_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      battles: {
        Row: {
          id: string;
          streamer_id: string;
          title: string;
          team_a_name: string;
          team_b_name: string;
          team_a_color: string;
          team_b_color: string;
          punishment: string | null;
          duration_seconds: number;
          status: BattleStatus;
          team_a_score: number;
          team_b_score: number;
          tiktok_username: string;
          started_at: string | null;
          ended_at: string | null;
          winner_team: TeamSide | "draw" | null;
          gift_multiplier: number;
          chat_command_a: string;
          chat_command_b: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          streamer_id: string;
          title: string;
          team_a_name?: string;
          team_b_name?: string;
          team_a_color?: string;
          team_b_color?: string;
          punishment?: string | null;
          duration_seconds?: number;
          status?: BattleStatus;
          team_a_score?: number;
          team_b_score?: number;
          tiktok_username: string;
          started_at?: string | null;
          ended_at?: string | null;
          winner_team?: TeamSide | "draw" | null;
          gift_multiplier?: number;
          chat_command_a?: string;
          chat_command_b?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["battles"]["Insert"]>;
      };
      battle_participants: {
        Row: {
          id: string;
          battle_id: string;
          tiktok_user: string;
          team: TeamSide;
          joined_at: string;
        };
        Insert: {
          id?: string;
          battle_id: string;
          tiktok_user: string;
          team: TeamSide;
          joined_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["battle_participants"]["Insert"]
        >;
      };
      gift_events: {
        Row: {
          id: string;
          battle_id: string;
          tiktok_user: string;
          gift_id: number;
          gift_name: string | null;
          repeat_count: number;
          diamond_value: number;
          team: TeamSide | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          battle_id: string;
          tiktok_user: string;
          gift_id: number;
          gift_name?: string | null;
          repeat_count?: number;
          diamond_value?: number;
          team?: TeamSide | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gift_events"]["Insert"]>;
      };
      user_plans: {
        Row: {
          id: string;
          user_id: string;
          plan: PlanType;
          mp_subscription_id: string | null;
          mp_preapproval_id: string | null;
          mp_status: MpStatus | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: PlanType;
          mp_subscription_id?: string | null;
          mp_preapproval_id?: string | null;
          mp_status?: MpStatus | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_plans"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          read: boolean;
          battle_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          read?: boolean;
          battle_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Functions: {
      add_gift_score: {
        Args: { p_battle_id: string; p_team: TeamSide; p_points: number };
        Returns: { team_a_score: number; team_b_score: number };
      };
      register_participant: {
        Args: {
          p_battle_id: string;
          p_tiktok_user: string;
          p_team: TeamSide;
        };
        Returns: void;
      };
      end_battle: {
        Args: { p_battle_id: string };
        Returns: void;
      };
      get_battle_stats: {
        Args: { p_battle_id: string };
        Returns: Json;
      };
    };
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Battle = Database["public"]["Tables"]["battles"]["Row"];
export type BattleInsert = Database["public"]["Tables"]["battles"]["Insert"];
export type BattleParticipant =
  Database["public"]["Tables"]["battle_participants"]["Row"];
export type GiftEvent = Database["public"]["Tables"]["gift_events"]["Row"];
export type UserPlan = Database["public"]["Tables"]["user_plans"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
