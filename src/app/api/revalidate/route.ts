import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { COLLECTIONS } from "@/lib/constants";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

/**
 * Drops the cached HTML of the public site.
 *
 * The public pages are statically rendered with `revalidate = 300`, so without
 * this an admin's save is invisible for up to five minutes. Every write in
 * `lib/firebase/repository.ts` calls this route so a save is reflected on the
 * next page view instead.
 *
 * Authorised the same way as `/api/admin/users`: the caller's ID token is
 * verified and must belong to an *active* admin. Any active admin qualifies —
 * editors change content too, and purging a cache is not a privileged action.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = getAdminAuth();
  const db = getAdminDb();

  if (!auth || !db) {
    return NextResponse.json(
      { ok: false, error: "The server has no Firebase credentials." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  let uid: string;
  try {
    ({ uid } = await auth.verifyIdToken(token, true));
  } catch {
    return NextResponse.json(
      { ok: false, error: "Your session has expired. Sign in again." },
      { status: 401 },
    );
  }

  const snapshot = await db.collection(COLLECTIONS.admins).doc(uid).get();
  if (!snapshot.exists || snapshot.data()?.isActive !== true) {
    return NextResponse.json(
      { ok: false, error: "Only an active administrator can refresh the site." },
      { status: 403 },
    );
  }

  // Site-wide on purpose. The header, footer and website settings render on
  // every route, so any single content change can affect any page — purging
  // one path would leave the rest stale and is not worth the bookkeeping.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, revalidatedAt: Date.now() });
}
