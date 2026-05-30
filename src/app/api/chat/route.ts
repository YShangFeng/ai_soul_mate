import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatCompletion } from "@/lib/ai/siliconflow";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { moderateContent, hasCriticalFlags } from "@/lib/ai/moderation";
import { checkMessageQuota, incrementMessageCount } from "@/lib/utils/quota";

// ============================================
// POST /api/chat — Send a message (SSE streaming)
// ============================================

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

  // 4. Quota check
  const quota = await checkMessageQuota(user.id);

  // getFirstCompanionId uses a restrictive query; we already have our companion
  // Rebuild the quota check with our known companionId
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .single();
  const isPro = sub?.plan === "pro";

  if (!isPro) {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("companion_id", companionId)
      .eq("role", "user")
      .gte("created_at", `${today}T00:00:00Z`)
      .lte("created_at", `${today}T23:59:59Z`);

    const used = count ?? 0;
    if (used >= 10) {
      return NextResponse.json(
        {
          error: {
            code: "QUOTA_EXCEEDED",
            message: "Daily message limit reached (10/day). Upgrade to Pro for unlimited messages.",
          },
        },
        { status: 429 },
      );
    }
  }

  // 5. Content moderation (user input)
  const userModeration = await moderateContent(message.trim());
  if (hasCriticalFlags(userModeration)) {
    // Store moderated message
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

  // 6. Store user message
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

  // 7. Build conversation context
  const systemPrompt = getSystemPrompt(
    companion.relationship as Parameters<typeof getSystemPrompt>[0],
    companion.name,
  );

  // Fetch last 20 messages for context
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("companion_id", companionId)
    .order("created_at", { ascending: false })
    .limit(20);

  const historyMessages = (history ?? []).reverse().map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...historyMessages.map((m) => ({
      role: m.role === "companion" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    })),
    { role: "user" as const, content: message.trim() },
  ];

  // 8. Stream the AI response
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

        // 9. Moderate the AI response
        if (fullResponse.trim()) {
          const aiModeration = await moderateContent(fullResponse);
          const isFlagged = hasCriticalFlags(aiModeration);

          // 10. Store AI response
          const { data: aiMessage } = await supabase
            .from("messages")
            .insert({
              companion_id: companionId,
              role: "companion",
              content: fullResponse,
              moderated: isFlagged,
              moderation_flagged: aiModeration.flagged,
            })
            .select()
            .single();

          // 11. Increment message count
          await incrementMessageCount(user.id);

          // 12. Send final metadata
          const remaining = isPro
            ? Infinity
            : Math.max(0, 10 - (await getTodayCount(supabase, companionId)));

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                messageId: aiMessage?.id,
                quota_remaining: remaining,
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
            `data: ${JSON.stringify({ error: "Stream failed" })}\n\n`,
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

  // Authenticate
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

  // Build query
  let query = supabase
    .from("messages")
    .select("*")
    .eq("companion_id", companionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    // Get the timestamp of the "before" message
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

// ============================================
// Helpers
// ============================================

async function getTodayCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companionId: string,
): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("companion_id", companionId)
    .eq("role", "user")
    .gte("created_at", `${today}T00:00:00Z`)
    .lte("created_at", `${today}T23:59:59Z`);
  return count ?? 0;
}
