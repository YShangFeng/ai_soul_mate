// ============================================
// OpenAI Moderation API Wrapper
// ============================================

const OPENAI_MODERATION_URL = "https://api.openai.com/v1/moderations";

export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  categoryScores: Record<string, number>;
}

/**
 * Check content against OpenAI's Moderation API.
 *
 * @param text - The text to moderate (user input or AI output)
 * @returns ModerationResult with flagged status and category details
 */
export async function moderateContent(text: string): Promise<ModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OPENAI_API_KEY not configured — skipping moderation");
    return { flagged: false, categories: {}, categoryScores: {} };
  }

  // Skip moderation for very short messages (greetings, etc.)
  if (text.trim().length < 2) {
    return { flagged: false, categories: {}, categoryScores: {} };
  }

  try {
    const response = await fetch(OPENAI_MODERATION_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: text }),
    });

    if (!response.ok) {
      console.error("Moderation API error:", response.status, await response.text());
      // Fail open — don't block messages if moderation is down
      return { flagged: false, categories: {}, categoryScores: {} };
    }

    const data = await response.json();
    const result = data.results?.[0];

    if (!result) {
      return { flagged: false, categories: {}, categoryScores: {} };
    }

    return {
      flagged: result.flagged ?? false,
      categories: result.categories ?? {},
      categoryScores: result.category_scores ?? {},
    };
  } catch (err) {
    console.error("Moderation request failed:", err);
    // Fail open
    return { flagged: false, categories: {}, categoryScores: {} };
  }
}

/**
 * Check if moderation flagged any critical categories.
 * Critical categories are those involving serious harm.
 */
export function hasCriticalFlags(result: ModerationResult): boolean {
  if (!result.flagged) return false;

  const criticalCategories = [
    "sexual",
    "sexual/minors",
    "harassment/threatening",
    "hate/threatening",
    "violence/graphic",
    "self-harm/intent",
    "self-harm/instructions",
  ];

  return criticalCategories.some((cat) => result.categories[cat]);
}
