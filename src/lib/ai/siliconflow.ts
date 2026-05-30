// AI API Client — supports both DeepSeek direct & SiliconFlow proxy

const SILICONFLOW_KEY = process.env.SILICONFLOW_API_KEY!;
const SILICONFLOW_BASE = process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

// ============================================
// Types
// ============================================

export interface GenerateAvatarParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
}

export interface GenerateAvatarResult {
  imageUrl: string;
  seed: number;
}

export interface ChatCompletionParams {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// ============================================
// Avatar Generation (Kwai-Kolors via SiliconFlow)
// ============================================

const SD_MODEL = "Kwai-Kolors/Kolors";

export async function generateAvatar(
  params: GenerateAvatarParams,
): Promise<GenerateAvatarResult> {
  const {
    prompt,
    negativePrompt = "",
    width = 1024,
    height = 1024,
    seed = Math.floor(Math.random() * 2_147_483_647),
    numInferenceSteps = 30,
    guidanceScale = 7.5,
  } = params;

  const response = await fetch(`${SILICONFLOW_BASE}/image/generations`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SILICONFLOW_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: SD_MODEL,
      prompt,
      negative_prompt: negativePrompt,
      width,
      height,
      seed,
      num_inference_steps: numInferenceSteps,
      guidance_scale: guidanceScale,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image generation failed: ${response.status} — ${errorText}`);
  }

  const data = await response.json();

  if (!data.images || data.images.length === 0) {
    throw new Error("No images returned from SiliconFlow");
  }

  return {
    imageUrl: data.images[0].url,
    seed: data.seed ?? seed,
  };
}

// ============================================
// Chat Completion — DeepSeek direct (preferred) or SiliconFlow proxy (fallback)
// ============================================

const CHAT_MODEL_SILICONFLOW = "deepseek-ai/DeepSeek-V4-Pro";
const CHAT_MODEL_DEEPSEEK = "deepseek-chat";

/**
 * Choose the best available backend:
 * - Direct DeepSeek API (if DEEPSEEK_API_KEY is set) — best quality
 * - SiliconFlow proxy (fallback)
 */
function getChatBackend(): { apiKey: string; baseUrl: string; model: string } {
  if (DEEPSEEK_KEY) {
    return { apiKey: DEEPSEEK_KEY, baseUrl: DEEPSEEK_BASE, model: CHAT_MODEL_DEEPSEEK };
  }
  return { apiKey: SILICONFLOW_KEY, baseUrl: SILICONFLOW_BASE, model: CHAT_MODEL_SILICONFLOW };
}

export async function chatCompletion(
  params: ChatCompletionParams,
): Promise<ReadableStream | string> {
  const backend = getChatBackend();
  const {
    messages,
    model = backend.model,
    temperature = 0.8,
    maxTokens = 1024,
    stream = false,
  } = params;

  const requestBody: Record<string, unknown> = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream,
  };

  // DeepSeek direct API supports these extra params for better quality
  if (DEEPSEEK_KEY) {
    requestBody.top_p = 0.9;
  }

  const response = await fetch(`${backend.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${backend.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat API failed (${backend.baseUrl}): ${response.status} — ${errorText}`);
  }

  if (stream) {
    return response.body!;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}
