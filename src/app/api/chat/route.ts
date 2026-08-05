import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

import { buildKnowledgeBase, buildSystemPrompt } from "@/lib/chat-context";
import { localAnswer } from "@/lib/chat-fallback";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getWebsiteSettings } from "@/lib/services/content";

/**
 * Website assistant.
 *
 * Streams a reply from Claude, grounded in the site's own Firestore content
 * (see `buildKnowledgeBase`). The API key never leaves the server.
 *
 * With no `ANTHROPIC_API_KEY` configured the endpoint returns 503 and the
 * widget falls back to a local keyword search over the same content, so the
 * chat button still does something useful before the key is set.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(24),
});

export async function POST(request: Request) {
  const ip = clientIp(request.headers);

  // Chat is the most expensive public endpoint — cap it per visitor.
  const limit = rateLimit(`chat:${ip}`, { limit: 20, windowMs: 10 * 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "You've sent a lot of messages. Please wait a moment before continuing." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message payload." }, { status: 400 });
  }

  // The first user turn must lead; drop any leading assistant greeting.
  const messages = parsed.data.messages.filter(
    (message, index) => !(index === 0 && message.role === "assistant"),
  );
  if (messages.length === 0) {
    return NextResponse.json({ error: "Invalid message payload." }, { status: 400 });
  }

  // No API key: answer from the site's own content with a keyword match and
  // label it plainly, rather than leaving the widget dead.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const answer = await localAnswer(lastUserMessage?.content ?? "");

    return new Response(answer, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        // Tells the widget to show the "basic mode" notice.
        "X-Assistant-Mode": "fallback",
      },
    });
  }

  try {
    const [knowledge, settings] = await Promise.all([
      buildKnowledgeBase(),
      getWebsiteSettings(),
    ]);

    const client = new Anthropic({ apiKey });

    const stream = client.messages.stream({
      model: "claude-opus-5",
      // Chat replies are deliberately short — two or three sentences.
      max_tokens: 1024,
      // Thinking stays on (it is the default on this model) but at low effort:
      // these are lookup-style questions over a small corpus, and low effort
      // keeps the widget responsive. Disabling thinking outright can leak
      // `<thinking>` tags into the visible reply, so this is the safer lever.
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: buildSystemPrompt(knowledge, settings.companyName),
          // The prompt is identical on every request — cache it so only the
          // conversation itself is billed at full rate.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    const encoder = new TextEncoder();

    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          const final = await stream.finalMessage();
          if (final.stop_reason === "refusal") {
            controller.enqueue(
              encoder.encode(
                "I can't help with that one. For anything else about GreenPass, ask away.",
              ),
            );
          }
        } catch (streamError) {
          console.error("[chat] Stream failed:", streamError);
          controller.enqueue(
            encoder.encode(
              "\n\nSorry — the connection dropped before I finished. Please try again.",
            ),
          );
        } finally {
          controller.close();
        }
      },
      cancel() {
        // The visitor closed the widget mid-answer; stop generating.
        stream.abort();
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const status = error instanceof Anthropic.APIError ? error.status : undefined;
    console.error("[chat] Request failed:", error);

    if (status === 429) {
      return NextResponse.json(
        { error: "The assistant is busy right now. Please try again in a moment." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "The assistant is unavailable right now. Please try again shortly." },
      { status: 502 },
    );
  }
}
