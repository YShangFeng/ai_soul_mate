// ============================================
// SoulMate.ai — Companion Type Definitions
// ============================================

export type Relationship = "romantic_partner" | "close_friend" | "life_mentor" | "fictional_character";

export type CompanionGender = "male" | "female" | "non_binary" | "any";

export type CompanionStyle = "realistic" | "anime" | "fantasy";

/** Display labels for UI */
export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  romantic_partner: "Romantic Partner",
  close_friend: "Close Friend",
  life_mentor: "Life Mentor",
  fictional_character: "Fictional Character",
};

export const GENDER_LABELS: Record<CompanionGender, string> = {
  male: "Male",
  female: "Female",
  non_binary: "Non-Binary",
  any: "Any",
};

export const STYLE_LABELS: Record<CompanionStyle, string> = {
  realistic: "Realistic",
  anime: "Anime",
  fantasy: "Fantasy",
};

/** Full companion entity returned from the database */
export interface Companion {
  id: string;
  userId: string;
  name: string;
  relationship: Relationship;
  gender: CompanionGender;
  style: CompanionStyle;
  avatarUrl: string | null;
  replicatePredictionId: string | null;
  personalitySummary: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a new companion */
export interface CompanionCreateInput {
  name: string;
  relationship: Relationship;
  gender: CompanionGender;
  style: CompanionStyle;
}

/** Maps snake_case DB row to camelCase Companion */
export function mapCompanionRow(row: {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  gender: string;
  style: string;
  avatar_url: string | null;
  replicate_prediction_id: string | null;
  personality_summary: string | null;
  created_at: string;
  updated_at: string;
}): Companion {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    relationship: row.relationship as Relationship,
    gender: row.gender as CompanionGender,
    style: row.style as CompanionStyle,
    avatarUrl: row.avatar_url,
    replicatePredictionId: row.replicate_prediction_id,
    personalitySummary: row.personality_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
