import type { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";

/**
 * Firestore documents contain `Timestamp`, `GeoPoint` and `DocumentReference`
 * values that React Server Components cannot pass to the client. Everything
 * that leaves a service goes through here first and comes back as plain JSON.
 */

function isTimestampLike(value: unknown): value is Timestamp {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  );
}

export function toPlainValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (isTimestampLike(value)) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toPlainValue);

  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    // Skip Firestore internals (DocumentReference, GeoPoint, Bytes, …).
    if ("_firestore" in source || "_delegate" in source) return null;

    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(source)) {
      out[key] = toPlainValue(val);
    }
    return out;
  }

  return value;
}

/** Convert a snapshot into `{ id, ...data }` with all dates as ISO strings. */
export function docToPlain<T>(snapshot: {
  id: string;
  data: () => DocumentData | undefined;
}): T | null {
  const data = snapshot.data();
  if (!data) return null;
  return { id: snapshot.id, ...(toPlainValue(data) as object) } as T;
}

export function docsToPlain<T>(docs: QueryDocumentSnapshot<DocumentData>[]): T[] {
  return docs
    .map((doc) => docToPlain<T>(doc))
    .filter((value): value is T => value !== null);
}

/**
 * Deep-merge a partial Firestore document over a complete default, so a
 * half-filled document never renders a page with `undefined` holes.
 */
export function withDefaults<T>(defaults: T, incoming: unknown): T {
  if (incoming === null || incoming === undefined) return defaults;

  if (Array.isArray(defaults)) {
    return (Array.isArray(incoming) && incoming.length > 0 ? incoming : defaults) as T;
  }

  if (
    typeof defaults === "object" &&
    defaults !== null &&
    typeof incoming === "object" &&
    !Array.isArray(incoming)
  ) {
    const merged: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
    const source = incoming as Record<string, unknown>;

    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;
      merged[key] =
        key in merged
          ? withDefaults((defaults as Record<string, unknown>)[key], value)
          : value;
    }
    return merged as T;
  }

  // Empty strings fall back to the default so blank admin fields stay readable.
  if (typeof incoming === "string" && incoming.trim() === "") return defaults;

  return incoming as T;
}
