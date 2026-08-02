import "server-only";

/**
 * Firebase Admin SDK — used by Server Components, route handlers and the seed
 * script. Credentials resolve in this order:
 *
 *  1. `FIREBASE_SERVICE_ACCOUNT_KEY` — the full service-account JSON, or a
 *     base64 encoding of it (handy for CI and App Hosting secrets).
 *  2. Individual `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` /
 *     `FIREBASE_PRIVATE_KEY` vars.
 *  3. Application Default Credentials — what Firebase App Hosting and Cloud
 *     Run inject automatically, so production usually needs no secrets at all.
 */

import {
  cert,
  getApp,
  getApps,
  initializeApp,
  applicationDefault,
  type App,
  type AppOptions,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const ADMIN_APP_NAME = "greenpass-admin";

function parseServiceAccount(raw: string): Record<string, string> | null {
  const trimmed = raw.trim();
  const json = trimmed.startsWith("{")
    ? trimmed
    : Buffer.from(trimmed, "base64").toString("utf8");

  try {
    return JSON.parse(json) as Record<string, string>;
  } catch {
    console.error("[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON or base64 JSON.");
    return null;
  }
}

function resolveOptions(): AppOptions | null {
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (rawServiceAccount) {
    const parsed = parseServiceAccount(rawServiceAccount);
    if (parsed?.project_id && parsed?.client_email && parsed?.private_key) {
      return {
        credential: cert({
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, "\n"),
        }),
        projectId: parsed.project_id,
        storageBucket,
      };
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      projectId,
      storageBucket,
    };
  }

  // Managed runtimes (App Hosting, Cloud Run, Cloud Functions) provide ADC.
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT || projectId) {
    return { credential: applicationDefault(), projectId, storageBucket };
  }

  return null;
}

let cachedApp: App | null | undefined;

function getAdminApp(): App | null {
  if (cachedApp !== undefined) return cachedApp;

  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME);
  if (existing) {
    cachedApp = existing;
    return cachedApp;
  }

  const options = resolveOptions();
  if (!options) {
    console.warn(
      "[firebase-admin] No credentials found — server-side reads will return empty data. " +
        "See .env.example for the required variables.",
    );
    cachedApp = null;
    return null;
  }

  try {
    cachedApp = initializeApp(options, ADMIN_APP_NAME);
  } catch (error) {
    // A parallel render may have won the race; reuse whatever landed.
    try {
      cachedApp = getApp(ADMIN_APP_NAME);
    } catch {
      console.error("[firebase-admin] Failed to initialise:", error);
      cachedApp = null;
    }
  }

  return cachedApp;
}

let cachedDb: Firestore | null | undefined;

/**
 * Admin Firestore instance, or `null` when credentials are missing.
 *
 * Callers must handle `null` — that is what keeps `next build` working on a
 * machine with no service account (pages render with empty/fallback content
 * instead of crashing the build).
 */
export function getAdminDb(): Firestore | null {
  if (cachedDb !== undefined) return cachedDb;

  const app = getAdminApp();
  if (!app) {
    cachedDb = null;
    return null;
  }

  const db = getFirestore(app);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // `settings()` throws if Firestore has already been used; safe to ignore.
  }

  cachedDb = db;
  return cachedDb;
}

export function getAdminAuth() {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminStorage() {
  const app = getAdminApp();
  return app ? getStorage(app) : null;
}

export const isAdminConfigured = () => getAdminApp() !== null;
