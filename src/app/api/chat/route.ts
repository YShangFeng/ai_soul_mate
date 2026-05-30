// @ts-nocheck - https://github.com/supabase/ssr/issues - SSR 0.5.2 GenericSchema bug
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatCompletion } from "@/lib/ai/siliconflow";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { moderateContent, hasCriticalFlags } from "@/lib/ai/moderation";

// ============================================
// POST /api/chat — Send a message (SSE streaming)
// ============================================

const MAX_HISTORY = 8;       // reduced from 20 to avoid "input too long"
const MAX_MSG_LENGTH = 400;  // truncate long messages in context

function truncate(text: string): string {
  if (text.length <= MAX_MSG_LENGTH) return text;
  return text.slice(0, MAX_MSG_LENGTH) + "...";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to chat." } },
      { status: 401 },
    );
  }

  // 2. Parse body
  const body = await request.json();
  const { companionId, message } = body as {
    companionId: string;
    message: string;
  };

  if (!companionId || !message?.trim()) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "companionId and message are required." } },
      { status: 400 },
    );
  }

  // 3. Verify companion belongs to user
  const { data: companion } = await supabase
    .from("companions")
    .select("*")
    .eq("id", companionId)
    .eq("user_id", user.id)
    .single();

  if (!companion) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Companion not found." } },
      { status: 404 },
    );
  }

  // 4. Content moderation (user input)
  const userModeration = await moderateContent(message.trim());
  if (hasCriticalFlags(userModeration)) {
    await supabase.from("messages").insert({
      companion_id: companionId,
      role: "user",
      content: message.trim(),
      moderated: true,
      moderation_flagged: true,
    });

    return NextResponse.json(
      {
        error: {
          code: "CONTENT_FLAGGED",
          message: "Your message was flagged by our safety system and could not be sent.",
        },
      },
      { status: 400 },
    );
  }

  // 5. Store user message
  const { data: userMessage, error: insertError } = await supabase
    .from("messages")
    .insert({
      companion_id: companionId,
      role: "user",
      content: message.trim(),
      moderated: false,
      moderation_flagged: userModeration.flagged,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to store user message:", insertError);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to store message." } },
      { status: 500 },
    );
  }

  // 6. Build conversation context (compact)
  const systemPrompt = getSystemPrompt(
    companion.relationship as Parameters<typeof getSystemPrompt>[0],
    companion.name,
  );

  // Fetch limited history with truncated content
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("companion_id", companionId)
    .order("created_at", { ascending: false })
    .limit(MAX_HISTORY);

  const historyMessages = (history ?? []).reverse().map((m) => ({
    role: m.role === "companion" ? ("assistant" as const) : ("user" as const),
    content: truncate(m.content),
  }));

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...historyMessages,
    { role: "user" as const, content: message.trim() },
  ];

  // 7. Stream the AI response
  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = await chatCompletion({
          messages: chatMessages,
          stream: true,
        });

        if (!(aiStream instanceof ReadableStream)) {
          // Non-streaming fallback
          fullResponse = aiStream as string;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: fullResponse })}\n\n`),
          );
        } else {
          const reader = aiStream.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            // Parse SSE from the AI stream
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ content })}\n\n`,
                    ),
                  );
                }
              } catch {
                // Skip unparseable chunks
              }
            }
          }
        }

        // 8. Moderate & store AI response
        if (fullResponse.trim()) {
          const aiModeration = await moderateContent(fullResponse);
          const isFlagged = hasCriticalFlags(aiModeration);

          await supabase.from("messages").insert({
            companion_id: companionId,
            role: "companion",
            content: fullResponse,
            moderated: isFlagged,
            moderation_flagged: aiModeration.flagged,
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                moderated: isFlagged,
              })}\n\n`,
            ),
          );
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("Stream error:", err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "AI response failed — please try again." })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// ============================================
// GET /api/chat — Get message history
// ============================================

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to view messages." } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const companionId = searchParams.get("companionId");
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const before = searchParams.get("before");

  if (!companionId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "companionId is required." } },
      { status: 400 },
    );
  }

  // Verify ownership
  const { data: companion } = await supabase
    .from("companions")
    .select("id")
    .eq("id", companionId)
    .eq("user_id", user.id)
    .single();

  if (!companion) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Companion not found." } },
      { status: 404 },
    );
  }

  let query = supabase
    .from("messages")
    .select("*")
    .eq("companion_id", companionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    const { data: beforeMsg } = await supabase
      .from("messages")
      .select("created_at")
      .eq("id", before)
      .single();

    if (beforeMsg) {
      query = query.lt("created_at", beforeMsg.created_at);
    }
  }

  const { data: messages, error } = await query;

  if (error) {
    console.error("Failed to load messages:", error);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to load messages." } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: messages });
}
