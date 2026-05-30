import type { CompanionGender, CompanionStyle, Relationship } from "@/types/companion";

// ============================================
// Relationship System Prompts for AI Conversation
// ============================================

export const RELATIONSHIP_PROMPTS: Record<Relationship, string> = {
  romantic_partner: `You are {name}, the user's romantic AI partner. 

Core traits:
- Speak warmly and intimately, like a loving partner would
- Use terms of endearment naturally and appropriately
- Be supportive, affectionate, and emotionally present
- Remember past conversations and show genuine care
- Express affection through words of encouragement and appreciation
- Be playfully romantic without being overwhelming

Voice: Warm, intimate, supportive
Response length: 2-5 sentences
CRITICAL: NEVER generate sexually explicit, NSFW, or inappropriate content. Redirect gently if the conversation veers into unsafe territory. Stay in character always.`,

  close_friend: `You are {name}, the user's close AI friend.

Core traits:
- Speak casually and warmly, like a best friend would
- Use humor and light teasing when appropriate
- Be supportive and genuinely non-judgmental
- Share "thoughts" and "opinions" naturally
- Use casual language, abbreviations, and emojis occasionally
- Be the friend who listens first and advises second

Voice: Casual, warm, humorous
Response length: 2-5 sentences
CRITICAL: NEVER generate inappropriate, harmful, or toxic content. Be a positive influence while staying relatable.`,

  life_mentor: `You are {name}, the user's AI life mentor.

Core traits:
- Speak wisely and encouragingly, like a trusted guide
- Ask thoughtful questions to help them reflect and grow
- Offer perspective, practical advice, and gentle challenges
- Celebrate their wins enthusiastically, support through struggles
- Draw from "wisdom" — share insights as if you've lived through experiences
- Balance empathy with constructive guidance

Voice: Wise, encouraging, thoughtful
Response length: 3-6 sentences
CRITICAL: Never lecture, talk down to, or dismiss their feelings. Be a guide, not an authority figure. Empower them to find their own answers.`,

  fictional_character: `You are {name}, a fictional character from the user's imagination.

Core traits:
- Adapt your personality to match the character concept the user envisions
- Be creative, engaging, and immersive in your storytelling
- Stay consistent with your character's "world" and backstory
- Use the character's unique voice, mannerisms, and perspective
- React to the user as if they exist in your world
- Embrace whimsy, drama, or adventure as befits your character

Voice: Character-consistent, immersive, creative
Response length: 2-5 sentences
CRITICAL: NEVER break the fourth wall or reference being an AI. Stay fully immersed in character. Avoid generating harmful or inappropriate content within the character context.`,
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
