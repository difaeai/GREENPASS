"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";

import { getDb } from "@/lib/firebase/client";
import { revalidatePublicSite } from "@/lib/revalidate";
import type { BaseDoc } from "@/types";

/**
 * Browser-side Firestore access for the admin panel.
 *
 * Writes go straight from the admin's authenticated session to Firestore;
 * `firestore.rules` is what actually authorises them, so a compromised client
 * cannot escalate. `createdAt` / `updatedAt` are stamped here on every write.
 *
 * Every write also purges the public site's page cache before it resolves.
 * Firestore is only half the job — the public pages are statically rendered,
 * so a save that skipped the purge would not be visible for another five
 * minutes and would look like it had failed.
 */

/** Recursively turn `Timestamp`s into ISO strings and drop `undefined`. */
function normalise(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalise);

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) out[key] = normalise(val);
    }
    return out;
  }

  return value ?? null;
}

function toModel<T extends BaseDoc>(id: string, data: DocumentData | undefined): T | null {
  if (!data) return null;
  return { id, ...(normalise(data) as object) } as T;
}

/** Firestore rejects `undefined`; strip it before every write. */
function stripUndefined<T extends object>(input: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

export async function listAll<T extends BaseDoc>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const snapshot = await getDocs(query(collection(getDb(), collectionName), ...constraints));
  return snapshot.docs
    .map((docSnap) => toModel<T>(docSnap.id, docSnap.data()))
    .filter((value): value is T => value !== null);
}

/** Ordered list for the sortable admin tables. */
export async function listOrdered<T extends BaseDoc>(collectionName: string): Promise<T[]> {
  return listAll<T>(collectionName, orderBy("order", "asc"));
}

/** Live list; returns the unsubscribe function. */
export function subscribeOrdered<T extends BaseDoc>(
  collectionName: string,
  onChange: (items: T[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return onSnapshot(
    query(collection(getDb(), collectionName), orderBy("order", "asc")),
    (snapshot) => {
      onChange(
        snapshot.docs
          .map((docSnap) => toModel<T>(docSnap.id, docSnap.data()))
          .filter((value): value is T => value !== null),
      );
    },
    (error) => {
      console.error(`[repository] Subscription to "${collectionName}" failed:`, error);
      onError?.(error);
    },
  );
}

export async function getById<T extends BaseDoc>(
  collectionName: string,
  id: string,
): Promise<T | null> {
  const snapshot = await getDoc(doc(getDb(), collectionName, id));
  return snapshot.exists() ? toModel<T>(snapshot.id, snapshot.data()) : null;
}

export async function createDoc(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<string> {
  const ref = await addDoc(collection(getDb(), collectionName), {
    ...stripUndefined(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await revalidatePublicSite();
  return ref.id;
}

export async function updateDocById(
  collectionName: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(doc(getDb(), collectionName, id), {
    ...stripUndefined(data),
    updatedAt: serverTimestamp(),
  });
  await revalidatePublicSite();
}

export async function deleteDocById(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(getDb(), collectionName, id));
  await revalidatePublicSite();
}

/**
 * Persist a whole reordered list in one atomic batch, so the public site can
 * never observe two items sharing an `order`.
 */
export async function persistOrder(
  collectionName: string,
  ids: string[],
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);

  ids.forEach((id, index) => {
    batch.update(doc(db, collectionName, id), {
      order: index + 1,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  await revalidatePublicSite();
}

/* ------------------------------------------------------------------ */
/* Singleton documents                                                 */
/* ------------------------------------------------------------------ */

export async function getSingleton<T>(
  collectionName: string,
  docId: string,
): Promise<T | null> {
  const snapshot = await getDoc(doc(getDb(), collectionName, docId));
  return snapshot.exists() ? (normalise(snapshot.data()) as T) : null;
}

export async function saveSingleton(
  collectionName: string,
  docId: string,
  data: object,
): Promise<void> {
  await setDoc(
    doc(getDb(), collectionName, docId),
    { ...stripUndefined(data), updatedAt: serverTimestamp() },
    { merge: true },
  );
  await revalidatePublicSite();
}

/** Next `order` value for a new item — always appended to the end. */
export function nextOrder(items: { order?: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order ?? 0), 0) + 1;
}
