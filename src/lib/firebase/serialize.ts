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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deep-merge a partial Firestore document over a complete default, so a
 * half-filled document never renders a page with `undefined` holes.
 *
 * Defaults only fill in what the document does not say. Anything the admin
 * *did* save wins, including a cleared field — a blank string and an emptied
 * list are deliberate edits, and resurrecting the seeded value there is what
 * makes the panel look like it never saved.
 */
export function withDefaults<T>(defaults: T, incoming: unknown): T {
  // The document does not carry this key at all — e.g. a field added to the
  // schema after the document was written.
  if (incoming === undefined) return defaults;

  if (incoming === null) {
    // The admin cleared an optional field ("no button label", "no CEO
    // signature"), so null is the answer. A null where a section object or a
    // list belongs is a malformed document instead, and there the default is
    // the safer read: no admin screen nulls those out — emptying a list saves
    // `[]` — and a null would crash the component that maps over it.
    const structural = typeof defaults === "object" && defaults !== null;
    return structural ? defaults : (null as T);
  }

  if (Array.isArray(defaults)) {
    // Including the empty array: the admin deleted every item in the list.
    return (Array.isArray(incoming) ? incoming : defaults) as T;
  }

  if (isPlainObject(defaults) && isPlainObject(incoming)) {
    const merged: Record<string, unknown> = { ...defaults };

    for (const [key, value] of Object.entries(incoming)) {
      if (value === undefined) continue;
      merged[key] = key in merged ? withDefaults(defaults[key], value) : value;
    }
    return merged as T;
  }

  return incoming as T;
}
