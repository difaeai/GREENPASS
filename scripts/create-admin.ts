/**
 * Creates (or promotes) an administrator.
 *
 *   npm run create-admin -- you@example.com "a-strong-password" "Your Name" [role]
 *
 * Falls back to SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME from
 * the environment when arguments are omitted.
 *
 * This is the only way to create the first admin: `firestore.rules` lets only
 * an existing superadmin write to the `admins` collection, and this script
 * bypasses rules by using the Admin SDK.
 *
 * Roles:
 *   superadmin  full access, including managing other admins
 *   admin       full content access
 *   editor      content access
 */

import { config } from "dotenv";
import { FieldValue } from "firebase-admin/firestore";

config({ path: ".env.local" });
config();

import { getAdminAuth, getAdminDb } from "../src/lib/firebase/admin";
import { COLLECTIONS } from "../src/lib/constants";

const VALID_ROLES = ["superadmin", "admin", "editor"] as const;
type Role = (typeof VALID_ROLES)[number];

const [emailArg, passwordArg, nameArg, roleArg] = process.argv.slice(2);

const email = (emailArg ?? process.env.SEED_ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = passwordArg ?? process.env.SEED_ADMIN_PASSWORD ?? "";
const name = nameArg ?? process.env.SEED_ADMIN_NAME ?? "Site Administrator";
const role = (roleArg ?? "superadmin") as Role;

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
  fail(
    "A valid email address is required.\n\n" +
      "  Usage: npm run create-admin -- you@example.com \"password\" \"Your Name\" [role]",
  );
}

if (!password || password.length < 8) {
  fail("A password of at least 8 characters is required.");
}

if (!VALID_ROLES.includes(role)) {
  fail(`Role must be one of: ${VALID_ROLES.join(", ")}`);
}

const auth = getAdminAuth();
const db = getAdminDb();

if (!auth || !db) {
  fail(
    "No Firebase Admin credentials found.\n" +
      "  Copy .env.example to .env.local and fill in the FIREBASE_* values.",
  );
}

async function main() {
  console.log(`\nCreating admin: ${email} (${role})\n`);

  // Reuse the account if it already exists — this doubles as a promote command.
  let uid: string;
  let created = false;

  try {
    const existing = await auth!.getUserByEmail(email);
    uid = existing.uid;
    console.log("  · Auth user already exists — updating password and profile");
    await auth!.updateUser(uid, { password, displayName: name });
  } catch (error) {
    if ((error as { code?: string }).code !== "auth/user-not-found") throw error;

    const user = await auth!.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });
    uid = user.uid;
    created = true;
    console.log("  ✔ Auth user created");
  }

  // A custom claim lets other services check the role without a Firestore read.
  // The `admins` document remains the source of truth for these rules.
  await auth!.setCustomUserClaims(uid, { admin: true, role });
  console.log("  ✔ Custom claims set");

  await db!.collection(COLLECTIONS.admins).doc(uid).set(
    {
      uid,
      email,
      name,
      role,
      isActive: true,
      photoURL: null,
      updatedAt: FieldValue.serverTimestamp(),
      ...(created ? { createdAt: FieldValue.serverTimestamp() } : {}),
    },
    { merge: true },
  );
  console.log("  ✔ admins/" + uid + " written");

  console.log(
    `\n✔ Done. Sign in at /admin/login with:\n` +
      `    email:    ${email}\n` +
      `    password: (the one you just set)\n`,
  );
}

main().catch((error) => {
  console.error("\n✖ Failed to create the admin:\n", error);
  process.exit(1);
});
