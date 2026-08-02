import "server-only";

/**
 * Google reCAPTCHA verification.
 *
 * Supports both v3 (score-based) and v2 (checkbox) — the same endpoint serves
 * both and v2 responses simply carry no `score`.
 *
 * When `RECAPTCHA_SECRET_KEY` is unset, verification is skipped and a warning
 * is logged. That keeps local development frictionless; production deployments
 * should always set the key.
 */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? 0.5);

interface VerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

export interface RecaptchaResult {
  ok: boolean;
  skipped: boolean;
  score?: number;
  reason?: string;
}

export async function verifyRecaptcha(
  token: string | undefined | null,
  remoteIp?: string | null,
): Promise<RecaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    console.warn(
      "[recaptcha] RECAPTCHA_SECRET_KEY is not set — skipping verification. " +
        "Set it before going to production.",
    );
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, skipped: false, reason: "Missing reCAPTCHA token." };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      // Never let a slow Google response hang the request.
      signal: AbortSignal.timeout(8000),
    });

    const result = (await response.json()) as VerifyResponse;

    if (!result.success) {
      return {
        ok: false,
        skipped: false,
        reason: `reCAPTCHA rejected the submission (${result["error-codes"]?.join(", ") ?? "unknown"}).`,
      };
    }

    // v2 has no score; treat its `success` as sufficient.
    if (typeof result.score === "number" && result.score < MIN_SCORE) {
      return {
        ok: false,
        skipped: false,
        score: result.score,
        reason: "This submission looked automated. Please try again.",
      };
    }

    return { ok: true, skipped: false, score: result.score };
  } catch (error) {
    console.error("[recaptcha] Verification request failed:", error);
    // Fail closed: a verification outage must not become an open spam gate.
    return {
      ok: false,
      skipped: false,
      reason: "Could not verify the reCAPTCHA challenge. Please try again shortly.",
    };
  }
}
