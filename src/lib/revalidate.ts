"use client";

import { getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Tells the server to throw away the cached public pages after an admin write.
 *
 * Without this the public site keeps serving the HTML it rendered up to five
 * minutes earlier (`revalidate = 300`), which reads as "my changes did not
 * save". Every write in `lib/firebase/repository.ts` awaits this.
 *
 * A failure here never fails the save: the data is already in Firestore, and
 * the page still refreshes on its own interval. It is logged, not thrown.
 */
export async function revalidatePublicSite(): Promise<void> {
  try {
    const user = getFirebaseAuth().currentUser;
    // Seed scripts and signed-out callers have nothing to authenticate with.
    if (!user) return;

    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
    });

    if (!response.ok) {
      console.error("[revalidate] Refresh failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("[revalidate] Refresh failed:", error);
  }
}
