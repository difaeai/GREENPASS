import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { COLLECTIONS } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { contactFormSchema } from "@/lib/validation";

/** Contact form submissions never make sense to cache. */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = clientIp(request.headers);

  // 1. Rate limit before doing any work.
  const limit = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  // 2. Parse and validate.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: firstIssue?.message ?? "Please check the form and try again." },
      { status: 400 },
    );
  }

  const { recaptchaToken, website, ...data } = parsed.data;

  // 3. Honeypot — a filled hidden field means a bot. Answer 200 so the bot
  //    believes it succeeded and does not retry with a different strategy.
  if (website) {
    console.warn(`[contact] Honeypot triggered from ${ip}.`);
    return NextResponse.json({ ok: true });
  }

  // 4. reCAPTCHA.
  const recaptcha = await verifyRecaptcha(recaptchaToken, ip);
  if (!recaptcha.ok) {
    return NextResponse.json(
      { ok: false, error: recaptcha.reason ?? "Verification failed." },
      { status: 400 },
    );
  }

  // 5. Persist.
  const db = getAdminDb();
  if (!db) {
    console.error("[contact] Firestore is not configured — submission dropped.");
    return NextResponse.json(
      { ok: false, error: "The contact form is temporarily unavailable. Please email us instead." },
      { status: 503 },
    );
  }

  try {
    await db.collection(COLLECTIONS.contactQueries).add({
      fullName: data.fullName,
      companyName: data.companyName || null,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      status: "new",
      notes: null,
      submittedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      ipHash: hashIp(ip),
      recaptchaScore: recaptcha.score ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] Failed to save the submission:", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't send your message. Please try again." },
      { status: 500 },
    );
  }
}

/**
 * Store a non-reversible fingerprint rather than the raw IP — enough to spot
 * abuse patterns in the admin panel without retaining personal data.
 */
function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i += 1) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
