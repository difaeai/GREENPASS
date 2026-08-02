import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { COLLECTIONS } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { newsletterSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = clientIp(request.headers);

  const limit = rateLimit(`newsletter:${ip}`, { limit: 6, windowMs: 10 * 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a valid email address." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const source = parsed.data.source ?? "website";

  const db = getAdminDb();
  if (!db) {
    console.error("[newsletter] Firestore is not configured — subscription dropped.");
    return NextResponse.json(
      { ok: false, error: "Subscriptions are temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    // The email is the document id, so re-subscribing is idempotent and the
    // collection can never accumulate duplicates.
    const docId = encodeURIComponent(email);
    const ref = db.collection(COLLECTIONS.newsletterSubscribers).doc(docId);
    const existing = await ref.get();

    if (existing.exists) {
      // Reactivate a previously unsubscribed address, but keep the original date.
      await ref.set(
        { isActive: true, source, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    await ref.set({
      email,
      source,
      isActive: true,
      subscribedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[newsletter] Failed to save the subscriber:", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't complete your subscription. Please try again." },
      { status: 500 },
    );
  }
}
