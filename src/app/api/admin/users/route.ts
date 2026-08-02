import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";

import { COLLECTIONS } from "@/lib/constants";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

/**
 * Administrator management.
 *
 * Creating and deleting an admin touches Firebase Auth, which the browser SDK
 * cannot do — hence this route. Every request is authorised by verifying the
 * caller's ID token and confirming they are an active `superadmin`, so this
 * endpoint is exactly as strict as the `admins` rules in `firestore.rules`.
 *
 * Role and status changes do NOT go through here: the admin panel writes those
 * directly to Firestore, where the rules already restrict them to superadmins.
 */

export const dynamic = "force-dynamic";

const createSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  name: z.string().trim().min(2).max(100),
  role: z.enum(["superadmin", "admin", "editor"]),
});

const deleteSchema = z.object({
  uid: z.string().trim().min(1),
});

/** Verify the bearer token and require an active superadmin. */
async function requireSuperAdmin(request: Request) {
  const auth = getAdminAuth();
  const db = getAdminDb();

  if (!auth || !db) {
    return {
      error: NextResponse.json(
        { ok: false, error: "Admin management is unavailable — the server has no Firebase credentials." },
        { status: 503 },
      ),
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return {
      error: NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 }),
    };
  }

  let uid: string;
  try {
    // `checkRevoked` so a disabled or signed-out session cannot keep acting.
    ({ uid } = await auth.verifyIdToken(token, true));
  } catch {
    return {
      error: NextResponse.json(
        { ok: false, error: "Your session has expired. Sign in again." },
        { status: 401 },
      ),
    };
  }

  const snapshot = await db.collection(COLLECTIONS.admins).doc(uid).get();
  const record = snapshot.data();

  if (!snapshot.exists || record?.isActive !== true || record?.role !== "superadmin") {
    return {
      error: NextResponse.json(
        { ok: false, error: "Only a superadmin can manage administrators." },
        { status: 403 },
      ),
    };
  }

  return { auth, db, callerUid: uid };
}

/* --------------------------------- create -------------------------------- */

export async function POST(request: Request) {
  const context = await requireSuperAdmin(request);
  if ("error" in context) return context.error;
  const { auth, db } = context;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." },
      { status: 400 },
    );
  }

  const { email, password, name, role } = parsed.data;
  const normalisedEmail = email.toLowerCase();

  try {
    let uid: string;

    try {
      // Reuse an existing Auth account rather than failing — this doubles as
      // "grant admin access to someone who already has a login".
      const existing = await auth.getUserByEmail(normalisedEmail);
      uid = existing.uid;
      await auth.updateUser(uid, { displayName: name });
    } catch (lookupError) {
      if ((lookupError as { code?: string }).code !== "auth/user-not-found") throw lookupError;
      const created = await auth.createUser({
        email: normalisedEmail,
        password,
        displayName: name,
        emailVerified: true,
      });
      uid = created.uid;
    }

    await auth.setCustomUserClaims(uid, { admin: true, role });

    await db.collection(COLLECTIONS.admins).doc(uid).set(
      {
        uid,
        email: normalisedEmail,
        name,
        role,
        isActive: true,
        photoURL: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ ok: true, uid });
  } catch (error) {
    const code = (error as { code?: string }).code;
    console.error("[admin/users] Create failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          code === "auth/invalid-password"
            ? "That password is too weak."
            : "Could not create the administrator.",
      },
      { status: 500 },
    );
  }
}

/* --------------------------------- delete -------------------------------- */

export async function DELETE(request: Request) {
  const context = await requireSuperAdmin(request);
  if ("error" in context) return context.error;
  const { auth, db, callerUid } = context;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "A user id is required." }, { status: 400 });
  }

  const { uid } = parsed.data;

  // Removing your own access would lock you out mid-session.
  if (uid === callerUid) {
    return NextResponse.json(
      { ok: false, error: "You cannot remove your own administrator account." },
      { status: 400 },
    );
  }

  try {
    // Refuse to remove the last superadmin — that would leave the project with
    // nobody able to manage admins ever again.
    const target = await db.collection(COLLECTIONS.admins).doc(uid).get();
    if (target.data()?.role === "superadmin") {
      const superAdmins = await db
        .collection(COLLECTIONS.admins)
        .where("role", "==", "superadmin")
        .get();

      if (superAdmins.size <= 1) {
        return NextResponse.json(
          { ok: false, error: "This is the only superadmin. Promote someone else first." },
          { status: 400 },
        );
      }
    }

    await db.collection(COLLECTIONS.admins).doc(uid).delete();

    // Revoke panel access but leave the Auth account intact — it may be a real
    // person's login for other services. Deleting the admin record is what
    // actually removes their access.
    await auth.setCustomUserClaims(uid, { admin: false, role: null });
    await auth.revokeRefreshTokens(uid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/users] Delete failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not remove this administrator." },
      { status: 500 },
    );
  }
}
