/**
 * Seeds Firestore with the default site content and the demo dataset.
 *
 *   npm run seed          # fill in only what is missing
 *   npm run seed -- --force   # overwrite existing documents too
 *
 * Safe to re-run: without `--force` it never overwrites a document that
 * already exists, so you cannot clobber real content by accident.
 */

import { config } from "dotenv";
import { FieldValue } from "firebase-admin/firestore";

// Load .env.local first so it wins over .env, matching Next.js behaviour.
config({ path: ".env.local" });
config();

import { getAdminDb } from "../src/lib/firebase/admin";
import { COLLECTIONS, DOC_IDS } from "../src/lib/constants";
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_HOME_CONTENT,
  DEFAULT_SEO_SETTINGS,
  DEFAULT_WEBSITE_SETTINGS,
} from "../src/lib/defaults";
import {
  SAMPLE_BANNERS,
  SAMPLE_CATEGORIES,
  SAMPLE_PROJECTS,
  SAMPLE_SERVICES,
  SAMPLE_TEAM,
  SAMPLE_TESTIMONIALS,
} from "../src/lib/sample-data";

const force = process.argv.includes("--force");

const db = getAdminDb();

if (!db) {
  console.error(
    "\n✖ No Firebase Admin credentials found.\n" +
      "  Copy .env.example to .env.local and fill in the FIREBASE_* values,\n" +
      "  then run this again.\n",
  );
  process.exit(1);
}

/** Strip the client-side fields the seed data carries but Firestore shouldn't. */
function stripMeta<T extends { id: string; createdAt?: unknown; updatedAt?: unknown }>(
  item: T,
): Omit<T, "id" | "createdAt" | "updatedAt"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = item;
  return rest;
}

async function seedSingleton(collection: string, docId: string, data: object, label: string) {
  const ref = db!.collection(collection).doc(docId);
  const snapshot = await ref.get();

  if (snapshot.exists && !force) {
    console.log(`  · ${label} already exists — skipped`);
    return;
  }

  await ref.set(
    { ...data, updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() },
    { merge: !force },
  );
  console.log(`  ✔ ${label} ${snapshot.exists ? "overwritten" : "created"}`);
}

async function seedCollection<T extends { id: string }>(
  collection: string,
  items: T[],
  label: string,
) {
  const existing = await db!.collection(collection).limit(1).get();

  if (!existing.empty && !force) {
    console.log(`  · ${label} already has documents — skipped`);
    return;
  }

  const batch = db!.batch();
  for (const item of items) {
    // Reuse the sample id as the document id so re-running is idempotent.
    batch.set(db!.collection(collection).doc(item.id), {
      ...stripMeta(item),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();

  console.log(`  ✔ ${label}: ${items.length} document(s) written`);
}

async function main() {
  console.log(`\nSeeding Firestore${force ? " (force: existing documents will be overwritten)" : ""}…\n`);

  console.log("Singletons");
  await seedSingleton(
    COLLECTIONS.websiteSettings,
    DOC_IDS.websiteSettings,
    DEFAULT_WEBSITE_SETTINGS,
    "website_settings/global",
  );
  await seedSingleton(
    COLLECTIONS.home,
    DOC_IDS.homeContent,
    DEFAULT_HOME_CONTENT,
    "home/content",
  );
  await seedSingleton(
    COLLECTIONS.about,
    DOC_IDS.aboutContent,
    DEFAULT_ABOUT_CONTENT,
    "about/content",
  );
  await seedSingleton(
    COLLECTIONS.seoSettings,
    DOC_IDS.seoSettings,
    DEFAULT_SEO_SETTINGS,
    "seo_settings/global",
  );

  console.log("\nCollections");
  await seedCollection(COLLECTIONS.homeBanners, SAMPLE_BANNERS, "home_banners");
  await seedCollection(COLLECTIONS.services, SAMPLE_SERVICES, "services");
  await seedCollection(
    COLLECTIONS.portfolioCategories,
    SAMPLE_CATEGORIES,
    "portfolio_categories",
  );
  await seedCollection(COLLECTIONS.portfolio, SAMPLE_PROJECTS, "portfolio");
  await seedCollection(COLLECTIONS.team, SAMPLE_TEAM, "team");
  await seedCollection(COLLECTIONS.testimonials, SAMPLE_TESTIMONIALS, "testimonials");

  console.log(
    "\n✔ Done.\n\n" +
      "  Next: create an admin account with\n" +
      "    npm run create-admin -- you@example.com 'a-strong-password' 'Your Name'\n",
  );
}

main().catch((error) => {
  console.error("\n✖ Seeding failed:\n", error);
  process.exit(1);
});
