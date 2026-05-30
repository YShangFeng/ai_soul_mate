// ============================================
// SoulMate.ai - Global Constants
// ============================================

// --- Relationship Types ---
export const RELATIONSHIP_TYPES = [
  "romantic_partner",
  "close_friend",
  "life_mentor",
  "fictional_character",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  romantic_partner: "Romantic Partner",
  close_friend: "Close Friend",
  life_mentor: "Life Mentor",
  fictional_character: "Fictional Character",
};

export const RELATIONSHIP_DESCRIPTIONS: Record<RelationshipType, string> = {
  romantic_partner: "A loving, supportive romantic companion who shares your journey.",
  close_friend: "A trustworthy best friend who always has your back.",
  life_mentor: "A wise guide who helps you grow and navigate life's challenges.",
  fictional_character: "A character from your imagination, brought to life.",
};

// --- Image Generation Styles ---
export const COMPANION_STYLES = ["realistic", "anime", "fantasy"] as const;

export type CompanionStyle = (typeof COMPANION_STYLES)[number];

export const STYLE_LABELS: Record<CompanionStyle, string> = {
  realistic: "Realistic",
  anime: "Anime",
  fantasy: "Fantasy",
};

// --- Gender Options ---
export const GENDER_OPTIONS = ["male", "female", "non_binary", "any"] as const;

export type GenderOption = (typeof GENDER_OPTIONS)[number];

export const GENDER_LABELS: Record<GenderOption, string> = {
  male: "Male",
  female: "Female",
  non_binary: "Non-Binary",
  any: "Any",
};

// --- Free Tier Limits ---
export const FREE_TIER = {
  /** Maximum number of image generations per day */
  MAX_DAILY_GENERATIONS: 3,
  /** Maximum number of daily messages */
  MAX_DAILY_MESSAGES: 30,
  /** Maximum conversation history retention (days) */
  MAX_HISTORY_DAYS: 7,
  /** Maximum image upload size (bytes) - 10MB */
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024,
  /** Allowed image MIME types */
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

// --- Pro Tier Limits ---
export const PRO_TIER = {
  MAX_DAILY_GENERATIONS: 30,
  MAX_DAILY_MESSAGES: 500,
  MAX_HISTORY_DAYS: 90,
  MAX_UPLOAD_SIZE: 20 * 1024 * 1024,
} as const;

// --- Pricing ---
export const PRICING = {
  PRO_MONTHLY: {
    amount: 9.99,
    currency: "USD",
    interval: "month",
    features: [
      "30 image generations/day",
      "500 messages/day",
      "90-day conversation history",
      "Priority AI response",
      "Ad-free experience",
    ],
  },
  PRO_WEEKLY: {
    amount: 2.99,
    currency: "USD",
    interval: "week",
    features: [
      "30 image generations/day",
      "500 messages/day",
      "90-day conversation history",
      "Priority AI response",
      "Ad-free experience",
    ],
  },
} as const;

// --- AI Configuration ---
export const AI_CONFIG = {
  /** Default chat model via SiliconFlow */
  CHAT_MODEL: "deepseek-ai/DeepSeek-V3",
  /** Fallback chat model */
  CHAT_MODEL_FALLBACK: "deepseek-ai/DeepSeek-R1",
  /** Image generation model */
  IMAGE_MODEL: "Kwai-Kolors/Kolors",
  /** Maximum conversation context tokens */
  MAX_CONTEXT_TOKENS: 4096,
  /** System prompt temperature */
  TEMPERATURE: 0.8,
  /** Max response tokens */
  MAX_RESPONSE_TOKENS: 512,
} as const;

// --- App Routes ---
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  AGE_GATE: "/age-gate",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  COMPANION: "/companion",
  SETTINGS: "/settings",
  PRICING: "/pricing",
} as const;

// --- Storage Buckets ---
export const STORAGE_BUCKETS = {
  USER_PHOTOS: "user-photos",
  COMPANION_IMAGES: "companion-images",
  CHAT_ATTACHMENTS: "chat-attachments",
} as const;
