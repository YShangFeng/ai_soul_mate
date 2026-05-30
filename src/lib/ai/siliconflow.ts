import OpenAI from "openai";

// ============================================
// SiliconFlow API Client (OpenAI-compatible)
// ============================================

const API_KEY = process.env.SILICONFLOW_API_KEY!;
const BASE_URL = process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

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
// Avatar Generation (Stable Diffusion via SiliconFlow)
// ============================================

// Kwai-Kolors via SiliconFlow
const SD_MODEL = "Kwai-Kolors/Kolors";

/**
 * Generate an avatar image using SiliconFlow's image generation endpoint.
 * Uses native fetch as SiliconFlow's image API deviates from OpenAI's DALL-E format.
 */
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

  const response = await fetch(`${BASE_URL}/image/generations`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
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
    throw new Error(`SiliconFlow image generation failed: ${response.status} — ${errorText}`);
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
// Chat Completion (for T04 conversation)
// ============================================

const CHAT_MODEL = "deepseek-ai/DeepSeek-V3";

/**
 * Send a chat completion request to SiliconFlow using the OpenAI SDK.
 * Supports streaming via the `stream` parameter.
 *
 * Non-streaming: returns the full response text.
 * Streaming: returns a ReadableStream for the caller to consume.
 */
export async function chatCompletion(
  params: ChatCompletionParams,
): Promise<ReadableStream | string> {
  const {
    messages,
    model = CHAT_MODEL,
    temperature = 0.7,
    maxTokens = 2048,
    stream = false,
  } = params;

  if (stream) {
    const response = await client.chat.completions.create({
      model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    return response.toReadableStream();
  }

  const response = await client.chat.completions.create({
    model,
    messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    temperature,
    max_tokens: maxTokens,
    stream: false,
  });

  return response.choices[0]?.message?.content ?? "";
}
