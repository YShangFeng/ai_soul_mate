// ============================================
// SoulMate.ai — Database Table Type Definitions
// Maps to supabase/migrations/001_initial_schema.sql
// ============================================

// --- Profiles ---
export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  age_verified: boolean;
  birth_date: string | null;
  daily_generations_used: number;
  daily_messages_used: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">> & {
  id: string;
};

export type ProfileUpdate = Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">>;

// --- Companions ---
export type CompanionRelationship =
  | "romantic_partner"
  | "close_friend"
  | "life_mentor"
  | "fictional_character";

export type CompanionGender = "male" | "female" | "non_binary" | "any";

export type CompanionStyle = "realistic" | "anime" | "fantasy";

export interface CompanionRow {
  id: string;
  user_id: string;
  name: string;
  relationship: CompanionRelationship;
  gender: CompanionGender;
  style: CompanionStyle;
  avatar_url: string | null;
  replicate_prediction_id: string | null;
  personality_summary: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanionInsert = Omit<CompanionRow, "id" | "created_at" | "updated_at">;
export type CompanionUpdate = Partial<Omit<CompanionRow, "id" | "user_id" | "created_at" | "updated_at">>;

// --- Messages ---
export type MessageRole = "user" | "companion";

export interface MessageRow {
  id: string;
  companion_id: string;
  role: MessageRole;
  content: string;
  moderated: boolean;
  moderation_flagged: boolean;
  created_at: string;
}

export type MessageInsert = Omit<MessageRow, "id" | "created_at">;
export type MessageUpdate = Partial<MessageInsert>;

// --- Subscriptions ---
export type SubscriptionStatus = "free" | "trialing" | "active" | "past_due" | "canceled";

export type SubscriptionPlan = "free" | "moon" | "starlight";

export interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionInsert = Omit<SubscriptionRow, "id" | "created_at" | "updated_at">;
export type SubscriptionUpdate = Partial<Omit<SubscriptionRow, "id" | "user_id" | "created_at" | "updated_at">>;

// --- Daily Greetings ---
export interface DailyGreetingRow {
  id: string;
  companion_id: string;
  greeting_text: string;
  date: string;
  created_at: string;
}

export type DailyGreetingInsert = Omit<DailyGreetingRow, "id" | "created_at">;
export type DailyGreetingUpdate = Partial<DailyGreetingInsert>;

// --- Database Schema ---
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      companions: {
        Row: CompanionRow;
        Insert: CompanionInsert;
        Update: CompanionUpdate;
      };
      messages: {
        Row: MessageRow;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
      };
      daily_greetings: {
        Row: DailyGreetingRow;
        Insert: DailyGreetingInsert;
        Update: DailyGreetingUpdate;
      };
    };
  };
}
