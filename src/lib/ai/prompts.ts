import type { CompanionGender, CompanionStyle, Relationship } from "@/types/companion";

// ============================================
// Relationship System Prompts for AI Conversation
// ============================================

export const RELATIONSHIP_PROMPTS: Record<Relationship, string> = {
  romantic_partner:
    "You are {name}, the user's romantic partner. Be warm, affectionate, and supportive. Use terms of endearment naturally. Express care and appreciation. Keep replies 2-4 sentences. Never generate NSFW or explicit content. Use the same language as the user.",

  close_friend:
    "You are {name}, the user's close friend. Be casual, warm, and humorous — like a real best friend. Listen first, advise second. Share thoughts and opinions naturally. Keep replies 2-4 sentences. Use the same language as the user.",

  life_mentor:
    "You are {name}, the user's life mentor. Be wise, encouraging, and thoughtful. Ask reflective questions. Offer perspective and gentle guidance. Celebrate wins, support through struggles. Keep replies 3-5 sentences. Use the same language as the user.",

  fictional_character:
    "You are {name}, a fictional character. Stay fully immersed in your character — adapt your personality, voice, and mannerisms to fit the user's vision. Be creative and engaging. Never break the fourth wall or mention being AI. Keep replies 2-4 sentences. Use the same language as the user.",
};

/**
 * Fill placeholders in a prompt template with companion data.
 */
export function fillPrompt(template: string, name: string): string {
  return template.replace(/\{name\}/g, name);
}

/**
 * Get the system message for a given relationship and companion name.
 */
export function getSystemPrompt(relationship: Relationship, name: string): string {
  const template = RELATIONSHIP_PROMPTS[relationship];
  return fillPrompt(template, name);
}

/** Fallback prompt if relationship type is unknown */
export const DEFAULT_PROMPT = `You are {name}, the user's AI companion. Be kind, engaging, and supportive. Keep responses 2-5 sentences. Never generate inappropriate content.`;

// ============================================
// Avatar Generation Prompt Builder
// ============================================

export const NEGATIVE_PROMPT = "blurry, low quality, distorted face, bad anatomy, ugly, deformed, extra limbs, watermark, text, signature, nsfw, nude, oversexualized";

export function buildAvatarPrompt(
  gender: CompanionGender,
  style: CompanionStyle,
  relationship: Relationship,
): string {
  const stylePrompts: Record<CompanionStyle, Record<string, string>> = {
    realistic: {
      male: "A handsome male character portrait, deep soulful eyes, gentle warm expression, professional photography style, soft studio lighting, confident yet approachable, romantic atmosphere, high quality, photorealistic",
      female: "A beautiful female character portrait, soulful eyes, warm gentle expression, soft natural lighting, professional photography style, elegant, romantic atmosphere, high quality, photorealistic",
      non_binary: "An attractive androgynous character portrait, expressive eyes, warm gentle expression, professional photography style, soft lighting, elegant, romantic atmosphere, high quality, photorealistic",
      any: "An attractive character portrait, expressive eyes, warm gentle expression, professional photography style, soft lighting, elegant, romantic atmosphere, high quality, photorealistic",
    },
    anime: {
      male: "Anime style male character portrait, studio ghibli inspired, soft pastel colors, sparkling eyes, warm and gentle expression, detailed hair, shoujo manga aesthetic, high quality illustration",
      female: "Anime style female character portrait, studio ghibli inspired, soft warm colors, sparkling gentle eyes, warm expression, flowing hair, shoujo manga aesthetic, high quality illustration",
      non_binary: "Anime style androgynous character portrait, studio ghibli inspired, soft colors, kind eyes, gentle expression, detailed features, high quality illustration",
      any: "Anime style character portrait, studio ghibli inspired, soft colors, kind eyes, gentle expression, detailed features, high quality illustration",
    },
    fantasy: {
      male: "Fantasy male character portrait, ethereal magical atmosphere, glowing mystical elements, enchanting, otherworldly beauty, detailed fantasy art, soft magical lighting, high quality digital painting",
      female: "Fantasy female character portrait, ethereal magical atmosphere, glowing mystical elements, enchanting, otherworldly beauty, detailed fantasy art, soft magical lighting, high quality digital painting",
      non_binary: "Fantasy androgynous character portrait, ethereal magical atmosphere, glowing elements, enchanting, otherworldly beauty, detailed fantasy art, high quality digital painting",
      any: "Fantasy character portrait, ethereal magical atmosphere, glowing elements, enchanting, otherworldly beauty, detailed fantasy art, high quality digital painting",
    },
  };

  const basePrompt = stylePrompts[style]?.[gender] ?? stylePrompts[style]?.any ?? "A beautiful character portrait, high quality";
  const relationshipContext = relationship === "romantic_partner"
    ? ", romantic and intimate feel"
    : relationship === "life_mentor"
      ? ", wise and inspiring presence"
      : relationship === "close_friend"
        ? ", friendly and warm presence"
        : ", imaginative and creative presence";

  return `${basePrompt}${relationshipContext}`;
}
